from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BankAccountViewSet, TransactionCategoryViewSet,
    TransactionViewSet, InvoiceViewSet, FinancialReportsView
)

router = DefaultRouter()
router.register(r'accounts', BankAccountViewSet)
router.register(r'categories', TransactionCategoryViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'invoices', InvoiceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('reports/', FinancialReportsView.as_view(), name='financial-reports'),
]
