from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TenantViewSet, LeaseDocumentViewSet

router = DefaultRouter()
router.register(r'tenants', TenantViewSet)
router.register(r'leases', LeaseDocumentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
