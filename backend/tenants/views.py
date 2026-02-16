from rest_framework import viewsets
from .models import Tenant, LeaseDocument
from .serializers import TenantSerializer, LeaseDocumentSerializer

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer

class LeaseDocumentViewSet(viewsets.ModelViewSet):
    queryset = LeaseDocument.objects.all()
    serializer_class = LeaseDocumentSerializer
