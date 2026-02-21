from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Payment
from .serializers import PaymentSerializer
from dateutil.relativedelta import relativedelta
from django.db import transaction
from datetime import date
from decimal import Decimal
import json


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('tenant', 'tenant__property').all()
    serializer_class = PaymentSerializer

    # Filtering, searching, ordering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_type', 'payment_method', 'tenant', 'date_due']
    search_fields = ['tenant__name', 'transaction_id', 'notes']
    ordering_fields = ['date_due', 'date_paid', 'amount', 'created_at', 'updated_at']
    ordering = ['-date_due']

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        payment_type = data.get('payment_type', 'RENT')
        tenant_id = data.get('tenant')
        date_due = data.get('date_due')

        target_payment = None

        # Reconciliation: find existing PENDING payment to update (avoid duplicates)
        if payment_type == 'RENT' and tenant_id and date_due:
            target_payment = Payment.objects.filter(
                tenant_id=tenant_id,
                status='PENDING',
                payment_type='RENT',
                date_due=date_due,
            ).first()

        with transaction.atomic():
            if target_payment:
                serializer = self.get_serializer(target_payment, data=data, partial=True)
            else:
                serializer = self.get_serializer(data=data)

            serializer.is_valid(raise_exception=True)
            payment = serializer.save()

            # Next-month auto-generation
            if payment.payment_type == 'RENT' and payment.status == 'PAID':
                latest_rent = Payment.objects.filter(
                    tenant=payment.tenant,
                    payment_type='RENT',
                ).order_by('-date_due').first()

                if latest_rent:
                    next_due_date = latest_rent.date_due + relativedelta(months=1)
                    exists = Payment.objects.filter(
                        tenant=payment.tenant,
                        payment_type='RENT',
                        date_due=next_due_date,
                    ).exists()

                    if not exists:
                        Payment.objects.create(
                            tenant=payment.tenant,
                            amount=payment.tenant.rent_amount,
                            original_amount=payment.tenant.rent_amount,
                            date_due=next_due_date,
                            payment_type='RENT',
                            status='PENDING',
                        )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Prevent editing PAID payments (unless explicitly un-paying)
        if instance.status == 'PAID' and request.data.get('status') != 'PENDING':
            date_paid = request.data.get('date_paid')
            # Allow if they're removing date_paid (reverting to unpaid)
            if date_paid is not None or 'date_paid' not in request.data:
                # Only block if not reverting — allow notes/payment_method edits on PAID
                immutable_fields = {'amount', 'date_due', 'tenant', 'payment_type'}
                changed_immutable = immutable_fields & set(request.data.keys())
                if changed_immutable:
                    return Response(
                        {"detail": f"Cannot modify {', '.join(changed_immutable)} on a PAID payment."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status == 'PAID':
            return Response(
                {"detail": "Cannot delete a PAID payment. Void it instead."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def receipt(self, request, pk=None):
        """Generate a receipt for a specific payment."""
        payment = self.get_object()
        if payment.status != 'PAID':
            return Response(
                {"detail": "Receipt is only available for PAID payments."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Build utilization breakdown
        utilization = payment.utilization_data or []
        if not utilization:
            # Fallback for payments created before utilization tracking
            utilization = [{
                'description': f"{payment.get_payment_type_display()} for {payment.date_due.strftime('%B %Y')}",
                'amount_applied': str(payment.amount),
                'status': payment.get_status_display(),
                'date_due': payment.date_due.isoformat(),
            }]

        receipt_data = {
            "receipt_number": f"RCP-{payment.id:06d}",
            "date_issued": date.today().isoformat(),
            "tenant": {
                "name": payment.tenant.name,
                "email": payment.tenant.email,
                "phone": payment.tenant.phone,
            },
            "property": {
                "house_number": payment.tenant.property.house_number if payment.tenant.property else None,
                "address": payment.tenant.property.address if payment.tenant.property else None,
            },
            "payment": {
                "id": payment.id,
                "type": payment.get_payment_type_display(),
                "method": payment.get_payment_method_display(),
                "amount": str(payment.amount),
                "amount_paid": str(payment.amount_paid),
                "date_due": payment.date_due.isoformat(),
                "date_paid": payment.date_paid.isoformat() if payment.date_paid else None,
                "transaction_id": payment.transaction_id or "",
                "notes": payment.notes,
            },
            "utilization": utilization,
            "balance": str(payment.balance),
        }
        return Response(receipt_data)
