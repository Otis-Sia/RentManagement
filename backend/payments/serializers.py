from datetime import date
from decimal import Decimal
from rest_framework import serializers

from .models import Payment


LATE_AFTER_DAYS = 5
FAILED_AFTER_DAYS = 35
MAX_RENT_FAILED_BEFORE_SEVERE = 1

class PaymentSerializer(serializers.ModelSerializer):
    clear_arrears_payment_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    clear_failed_payment_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    all_inclusive = serializers.BooleanField(write_only=True, required=False, default=False)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    tenant_phone = serializers.CharField(source='tenant.phone', read_only=True)
    house_number = serializers.CharField(source='tenant.property.house_number', read_only=True)
    house_id = serializers.IntegerField(source='tenant.property.id', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['status']  # Status is auto-calculated

    def _compute_base_status(self, date_due, date_paid):
        reference_date = date_paid or date.today()
        overdue_days = (reference_date - date_due).days

        if overdue_days <= 0:
            return 'PAID' if date_paid else 'PENDING'
        if date_paid and overdue_days <= LATE_AFTER_DAYS:
            return 'PAID'
        if overdue_days > FAILED_AFTER_DAYS:
            return 'FAILED'
        if overdue_days > LATE_AFTER_DAYS:
            return 'LATE'
        return 'PENDING'

    def _compute_status_for_tenant(self, *, tenant, date_due, date_paid, payment_type, instance_id=None):
        status = self._compute_base_status(date_due, date_paid)

        if status in ['PAID', 'PENDING'] or not tenant:
            return status

        if status == 'LATE':
            existing_late_qs = Payment.objects.filter(
                tenant=tenant,
                status='LATE'
            )
            if instance_id:
                existing_late_qs = existing_late_qs.exclude(id=instance_id)

            if existing_late_qs.exists():
                status = 'FAILED'

        if status == 'FAILED' and payment_type == 'RENT':
            existing_failed_count = Payment.objects.filter(
                tenant=tenant,
                status='FAILED',
                payment_type='RENT'
            ).exclude(id=instance_id).count()

            if existing_failed_count >= MAX_RENT_FAILED_BEFORE_SEVERE:
                status = 'SEVERE'

        return status

    def _apply_payment_to_single_arrears(self, payment, arrears_payment):
        paid_amount = Decimal(str(payment.amount or 0))
        arrears_amount = Decimal(str(arrears_payment.amount or 0))

        if paid_amount >= arrears_amount:
            arrears_payment.date_paid = payment.date_paid or date.today()
            arrears_payment.status = 'PAID'
            if payment.transaction_id and not arrears_payment.transaction_id:
                arrears_payment.transaction_id = payment.transaction_id
            arrears_payment.save(update_fields=['date_paid', 'status', 'transaction_id'])
            return

        arrears_payment.amount = arrears_amount - paid_amount
        arrears_payment.date_paid = None
        arrears_payment.save(update_fields=['amount', 'date_paid'])

    def _apply_payment_to_all_arrears(self, payment):
        remaining_amount = Decimal(str(payment.amount or 0))
        if remaining_amount <= 0:
            return

        arrears_payments = Payment.objects.filter(
            tenant=payment.tenant,
            status__in=['LATE', 'FAILED', 'SEVERE']
        ).exclude(id=payment.id).order_by('date_due', 'id')

        for arrears_payment in arrears_payments:
            if remaining_amount <= 0:
                break

            arrears_amount = Decimal(str(arrears_payment.amount or 0))
            if remaining_amount >= arrears_amount:
                arrears_payment.date_paid = payment.date_paid or date.today()
                arrears_payment.status = 'PAID'
                if payment.transaction_id and not arrears_payment.transaction_id:
                    arrears_payment.transaction_id = payment.transaction_id
                arrears_payment.save(update_fields=['date_paid', 'status', 'transaction_id'])
                remaining_amount -= arrears_amount
            else:
                arrears_payment.amount = arrears_amount - remaining_amount
                arrears_payment.date_paid = None
                arrears_payment.save(update_fields=['amount', 'date_paid'])
                remaining_amount = Decimal('0')
                break

    def validate(self, data):
        """
        Automatically determine the status based on payment date and due date.
        """
        date_due = data.get('date_due')
        date_paid = data.get('date_paid')
        tenant = data.get('tenant') or getattr(self.instance, 'tenant', None)
        payment_type = data.get('payment_type') or getattr(self.instance, 'payment_type', 'RENT')

        if not date_due:
            # If it's an update and date_due isn't provided, get it from instance
            if self.instance:
                date_due = self.instance.date_due
            else:
                raise serializers.ValidationError({"date_due": "Date due is required."})

        if not date_paid and self.instance and 'date_paid' not in data:
            date_paid = self.instance.date_paid

        data['status'] = self._compute_status_for_tenant(
            tenant=tenant,
            date_due=date_due,
            date_paid=date_paid,
            payment_type=payment_type,
            instance_id=getattr(self.instance, 'id', None)
        )

        clear_arrears_payment_id = data.get('clear_arrears_payment_id')
        clear_failed_payment_id = data.get('clear_failed_payment_id')
        all_inclusive = bool(data.get('all_inclusive', False))
        selected_clear_payment_id = clear_arrears_payment_id if clear_arrears_payment_id is not None else clear_failed_payment_id

        if all_inclusive and payment_type != 'RENT':
            raise serializers.ValidationError({
                "all_inclusive": "All-inclusive payment is only available for rent payments."
            })

        if selected_clear_payment_id is not None:
            if not date_paid:
                raise serializers.ValidationError({
                    "date_paid": "Date paid is required when clearing an arrears payment."
                })

            tenant = data.get('tenant') or getattr(self.instance, 'tenant', None)
            if not tenant:
                raise serializers.ValidationError({"tenant": "Tenant is required when clearing an arrears payment."})

            arrears_payment = Payment.objects.filter(
                id=selected_clear_payment_id,
                tenant=tenant,
                status__in=['LATE', 'FAILED', 'SEVERE']
            ).first()

            if not arrears_payment:
                raise serializers.ValidationError({
                    "clear_arrears_payment_id": "Selected arrears payment does not exist for this tenant."
                })

            data['clear_arrears_payment_id'] = selected_clear_payment_id
        elif all_inclusive:
            if not date_paid:
                raise serializers.ValidationError({
                    "date_paid": "Date paid is required when using all-inclusive payment."
                })

            if not tenant:
                raise serializers.ValidationError({"tenant": "Tenant is required when using all-inclusive payment."})

            data['all_inclusive'] = True
        
        return data

    def create(self, validated_data):
        clear_arrears_payment_id = validated_data.pop('clear_arrears_payment_id', None)
        clear_failed_payment_id = validated_data.pop('clear_failed_payment_id', None)
        all_inclusive = bool(validated_data.pop('all_inclusive', False))
        selected_clear_payment_id = clear_arrears_payment_id if clear_arrears_payment_id is not None else clear_failed_payment_id
        payment = super().create(validated_data)

        if selected_clear_payment_id is not None:
            arrears_payment = Payment.objects.filter(
                id=selected_clear_payment_id,
                tenant=payment.tenant,
                status__in=['LATE', 'FAILED', 'SEVERE']
            ).first()

            if arrears_payment:
                self._apply_payment_to_single_arrears(payment, arrears_payment)
        elif all_inclusive and payment.payment_type == 'RENT':
            self._apply_payment_to_all_arrears(payment)

        return payment
