from rest_framework import viewsets
from rest_framework.response import Response
from .models import Tenant, LeaseDocument
from .serializers import TenantSerializer, LeaseDocumentSerializer

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer

    def retrieve(self, request, *args, **kwargs):
        from .serializers import TenantDetailSerializer
        instance = self.get_object()
        serializer = TenantDetailSerializer(instance)
        return Response(serializer.data)

class LeaseDocumentViewSet(viewsets.ModelViewSet):
    queryset = LeaseDocument.objects.all()
    serializer_class = LeaseDocumentSerializer
