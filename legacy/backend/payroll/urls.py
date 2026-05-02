from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, PayrollRunViewSet, PaycheckViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'payroll-runs', PayrollRunViewSet)
router.register(r'paychecks', PaycheckViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
