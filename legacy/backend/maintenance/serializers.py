from rest_framework import serializers
from .models import MaintenanceRequest

class MaintenanceRequestSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    house_number = serializers.CharField(source='tenant.property.house_number', read_only=True)
    house_id = serializers.IntegerField(source='tenant.property.id', read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = '__all__'
