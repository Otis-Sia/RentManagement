from datetime import date, timedelta
from rest_framework import serializers

from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
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
        
        return data
