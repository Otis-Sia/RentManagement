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
