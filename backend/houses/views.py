from rest_framework import viewsets
from rest_framework.response import Response
from .models import Property
from .serializers import PropertySerializer, PropertyDetailSerializer


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to return detailed property information"""
        instance = self.get_object()
        serializer = PropertyDetailSerializer(instance)
        return Response(serializer.data)
