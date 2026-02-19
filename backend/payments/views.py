from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer
from dateutil.relativedelta import relativedelta
from django.db import transaction

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        payment_type = data.get('payment_type', 'RENT')
        all_inclusive = data.get('all_inclusive', False)
        tenant_id = data.get('tenant')
        date_due = data.get('date_due')

        target_payment = None

        # 1. Reconciliation Logic: Find existing payment to update
        if payment_type == 'RENT' and tenant_id:
            if all_inclusive:
                # Find oldest unpaid payment (LATE, FAILED, SEVERE, DEFAULTED, or PENDING)
                target_payment = Payment.objects.filter(
                    tenant_id=tenant_id,
                    status__in=['LATE', 'FAILED', 'SEVERE', 'DEFAULTED', 'PENDING'],
                    payment_type='RENT'
                ).order_by('date_due').first()
            elif date_due:
                # Find specific pending payment for this due date (month/year match)
                # We match by exact date first, or month/year if needed.
                # Here we assume the frontend sends the exact due date of the pending payment.
                target_payment = Payment.objects.filter(
                    tenant_id=tenant_id,
                    status='PENDING',
                    payment_type='RENT',
                    date_due=date_due
                ).first()

        with transaction.atomic():
            if target_payment:
                # Update existing payment
                serializer = self.get_serializer(target_payment, data=data, partial=True)
            else:
                # Create new payment
                serializer = self.get_serializer(data=data)

            serializer.is_valid(raise_exception=True)
            payment = serializer.save()

            # 2. Next Month Generation Logic
            if payment.payment_type == 'RENT' and payment.status == 'PAID':
                # Get the latest rent payment (by due date) to determine the next period
                latest_rent = Payment.objects.filter(
                    tenant=payment.tenant,
                    payment_type='RENT'
                ).order_by('-date_due').first()

                if latest_rent:
                    next_due_date = latest_rent.date_due + relativedelta(months=1)
                    
                    # Check if next month already exists
                    exists = Payment.objects.filter(
                        tenant=payment.tenant,
                        payment_type='RENT',
                        date_due=next_due_date
                    ).exists()

                    if not exists:
                        Payment.objects.create(
                            tenant=payment.tenant,
                            amount=payment.tenant.rent_amount, # Use tenant's current rent amount
                            date_due=next_due_date,
                            payment_type='RENT',
                            status='PENDING'
                        )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
