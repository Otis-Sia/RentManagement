from datetime import date
from rest_framework import serializers
from .models import Property
from tenants.models import Tenant
from payments.models import Payment
from maintenance.models import MaintenanceRequest


class PropertySerializer(serializers.ModelSerializer):
    current_tenant_name = serializers.SerializerMethodField()
    current_tenant_id = serializers.SerializerMethodField()
    current_tenant_rent_due_day = serializers.SerializerMethodField()
    is_occupied = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = '__all__'
    
    def get_current_tenant_name(self, obj):
        tenant = obj.get_current_tenant()
        return tenant.name if tenant else None

    def get_current_tenant_id(self, obj):
        tenant = obj.get_current_tenant()
        return tenant.id if tenant else None

    def get_is_occupied(self, obj):
        """
        Check if the property is occupied by a tenant with an active lease
        covering the current date.
        """
        today = date.today()
        return obj.tenants.filter(
            is_active=True,
            lease_start__lte=today,
            lease_end__gte=today
        ).exists()

    def get_current_tenant_rent_due_day(self, obj):
        tenant = obj.get_current_tenant()
        return tenant.rent_due_day if tenant else None


class TenantBasicSerializer(serializers.ModelSerializer):
    """Simplified tenant serializer for nested display"""
    class Meta:
        model = Tenant
        fields = ['id', 'name', 'email', 'phone', 'lease_start', 'lease_end', 'is_active']


class PaymentBasicSerializer(serializers.ModelSerializer):
    """Simplified payment serializer for nested display"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    tenant_id = serializers.IntegerField(source='tenant.id', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'tenant_name', 'tenant_id', 'amount', 'date_due', 'date_paid', 'payment_type', 'status', 'created_at']


class MaintenanceBasicSerializer(serializers.ModelSerializer):
    """Simplified maintenance serializer for nested display"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    tenant_id = serializers.IntegerField(source='tenant.id', read_only=True)
    
    class Meta:
        model = MaintenanceRequest
        fields = ['id', 'tenant_name', 'tenant_id', 'title', 'description', 'priority', 'status', 'cost', 'request_date', 'resolved_date']


class PropertyDetailSerializer(serializers.ModelSerializer):
    current_tenant = serializers.SerializerMethodField()
    payment_history = serializers.SerializerMethodField()
    maintenance_requests = serializers.SerializerMethodField()
    tenant_history = serializers.SerializerMethodField()
    is_occupied = serializers.SerializerMethodField()
    latest_payment_status = serializers.SerializerMethodField()
    
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

    def get_is_occupied(self, obj):
        """
        Check if the property is occupied by a tenant with an active lease
        covering the current date.
        """
        today = date.today()
        return obj.tenants.filter(
            is_active=True,
            lease_start__lte=today,
            lease_end__gte=today
        ).exists()

    def get_latest_payment_status(self, obj):
        """
        Get the status of the most recent payment due.
        """
        from payments.models import Payment
        # Get the latest payment due
        latest_payment = Payment.objects.filter(tenant__property=obj).order_by('-date_due').first()
        if latest_payment:
            return {
                'status': latest_payment.status,
                'date_due': latest_payment.date_due,
                'amount': latest_payment.amount
            }
        return None
