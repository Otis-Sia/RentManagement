from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BroadcastMessageViewSet, building_addresses

router = DefaultRouter()
router.register(r'broadcasts', BroadcastMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('building-addresses/', building_addresses, name='building-addresses'),
]
