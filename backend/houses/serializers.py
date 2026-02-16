from rest_framework import serializers
from .models import Property
from tenants.models import Tenant
from payments.models import Payment
from maintenance.models import MaintenanceRequest




class TenantBasicSerializer(serializers.ModelSerializer):
    """Simplified tenant serializer for nested display"""
    class Meta:
        model = Tenant
        fields = ['id', 'name', 'email', 'phone', 'lease_start', 'lease_end', 'is_active']


class PaymentBasicSerializer(serializers.ModelSerializer):
    """Simplified payment serializer for nested display"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'tenant_name', 'amount', 'date_due', 'date_paid', 'payment_type', 'status', 'created_at']


class MaintenanceBasicSerializer(serializers.ModelSerializer):
    """Simplified maintenance serializer for nested display"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = MaintenanceRequest
        fields = ['id', 'tenant_name', 'title', 'description', 'priority', 'status', 'cost', 'request_date', 'resolved_date']


class PropertyDetailSerializer(serializers.ModelSerializer):
    current_tenant = serializers.SerializerMethodField()
    payment_history = serializers.SerializerMethodField()
    maintenance_requests = serializers.SerializerMethodField()
    tenant_history = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = '__all__'
    
    def get_current_tenant(self, obj):
        tenant = obj.get_current_tenant()
        return TenantBasicSerializer(tenant).data if tenant else None
    
    def get_payment_history(self, obj):
        payments = obj.get_payment_history()
        return PaymentBasicSerializer(payments, many=True).data
    
    def get_maintenance_requests(self, obj):
        requests = obj.get_maintenance_requests()
        return MaintenanceBasicSerializer(requests, many=True).data
    
    def get_tenant_history(self, obj):
        tenants = obj.get_tenant_history()
        return TenantBasicSerializer(tenants, many=True).data
