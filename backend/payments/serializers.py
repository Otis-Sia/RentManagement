from datetime import date, timedelta
from rest_framework import serializers

from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    clear_arrears_payment_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    clear_failed_payment_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    tenant_phone = serializers.CharField(source='tenant.phone', read_only=True)
    house_number = serializers.CharField(source='tenant.property.house_number', read_only=True)
    house_id = serializers.IntegerField(source='tenant.property.id', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['status']  # Status is auto-calculated

    def validate(self, data):
        """
        Automatically determine the status based on payment date and due date.
        """
        date_due = data.get('date_due')
        date_paid = data.get('date_paid')
        amount = data.get('amount')

        if not date_due:
            # If it's an update and date_due isn't provided, get it from instance
            if self.instance:
                date_due = self.instance.date_due
            else:
                raise serializers.ValidationError({"date_due": "Date due is required."})

        # Calculate status
        if not date_paid:
            data['status'] = 'PENDING'
        else:
            # Logic for status
            # If paid on or before due date -> PAID
            if date_paid <= date_due:
                data['status'] = 'PAID'
            # If paid more than 30 days after due date -> FAILED
            elif date_paid > date_due + timedelta(days=30):
                data['status'] = 'FAILED'
            # If paid after due date but within 30 days -> LATE
            else:
                data['status'] = 'LATE'

        clear_arrears_payment_id = data.get('clear_arrears_payment_id')
        clear_failed_payment_id = data.get('clear_failed_payment_id')
        selected_clear_payment_id = clear_arrears_payment_id if clear_arrears_payment_id is not None else clear_failed_payment_id

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
                status__in=['LATE', 'FAILED']
            ).first()

            if not arrears_payment:
                raise serializers.ValidationError({
                    "clear_arrears_payment_id": "Selected arrears payment does not exist for this tenant."
                })

            data['clear_arrears_payment_id'] = selected_clear_payment_id
        
        return data

    def create(self, validated_data):
        clear_arrears_payment_id = validated_data.pop('clear_arrears_payment_id', None)
        clear_failed_payment_id = validated_data.pop('clear_failed_payment_id', None)
        selected_clear_payment_id = clear_arrears_payment_id if clear_arrears_payment_id is not None else clear_failed_payment_id
        payment = super().create(validated_data)

        if selected_clear_payment_id is not None:
            arrears_payment = Payment.objects.filter(
                id=selected_clear_payment_id,
                tenant=payment.tenant,
                status__in=['LATE', 'FAILED']
            ).first()

            if arrears_payment:
                arrears_payment.date_paid = payment.date_paid or date.today()
                arrears_payment.status = 'PAID'
                if payment.transaction_id and not arrears_payment.transaction_id:
                    arrears_payment.transaction_id = payment.transaction_id
                arrears_payment.save(update_fields=['date_paid', 'status', 'transaction_id'])

        return payment
