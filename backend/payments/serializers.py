from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    house_number = serializers.CharField(source='tenant.property.house_number', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
