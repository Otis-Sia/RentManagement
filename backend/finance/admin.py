from django.contrib import admin
from .models import BankAccount, TransactionCategory, Transaction, Invoice, InvoiceItem


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = ['name', 'account_type', 'institution', 'balance', 'is_active']
    list_filter = ['account_type', 'is_active']


@admin.register(TransactionCategory)
class TransactionCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_type', 'is_tax_deductible']
    list_filter = ['category_type', 'is_tax_deductible']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['date', 'description', 'transaction_type', 'amount', 'category', 'status']
    list_filter = ['transaction_type', 'status', 'category']
    search_fields = ['description', 'payee', 'reference']
    date_hierarchy = 'date'


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'tenant', 'client_name', 'total', 'status', 'due_date']
    list_filter = ['status']
    inlines = [InvoiceItemInline]
