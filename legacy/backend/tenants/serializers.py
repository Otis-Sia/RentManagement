from rest_framework import serializers
from .models import Tenant, LeaseDocument

class LeaseDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaseDocument
        fields = '__all__'

class TenantSerializer(serializers.ModelSerializer):
    leases = LeaseDocumentSerializer(many=True, read_only=True)
    house_number = serializers.CharField(source='property.house_number', read_only=True)

    class Meta:
        model = Tenant
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        from payments.models import Payment
        model = Payment
        fields = ['id', 'amount', 'date_due', 'date_paid', 'payment_type', 'status', 'transaction_id', 'created_at']

class MaintenanceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        from maintenance.models import MaintenanceRequest
        model = MaintenanceRequest
        fields = ['id', 'title', 'description', 'priority', 'status', 'cost', 'request_date', 'resolved_date']

class TenantDetailSerializer(serializers.ModelSerializer):
    leases = LeaseDocumentSerializer(many=True, read_only=True)
    house_number = serializers.CharField(source='property.house_number', read_only=True)
    house_address = serializers.CharField(source='property.address', read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    maintenance_requests = MaintenanceRequestSerializer(many=True, read_only=True)

    class Meta:
        model = Tenant
        fields = '__all__'
