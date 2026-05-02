from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class BankAccount(models.Model):
    """Linked bank account or credit card for automatic transaction tracking."""
    ACCOUNT_TYPE_CHOICES = [
        ('CHECKING', 'Checking Account'),
        ('SAVINGS', 'Savings Account'),
        ('CREDIT_CARD', 'Credit Card'),
        ('CASH', 'Cash'),
        ('MOBILE_MONEY', 'Mobile Money'),
    ]

    name = models.CharField(max_length=255, help_text="Account display name")
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES)
    institution = models.CharField(max_length=255, blank=True, help_text="Bank or institution name")
    account_number_last4 = models.CharField(max_length=4, blank=True, help_text="Last 4 digits for reference")
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_account_type_display()})"


class TransactionCategory(models.Model):
    """Categories for income and expense transactions."""
    CATEGORY_TYPE_CHOICES = [
        ('INCOME', 'Income'),
        ('EXPENSE', 'Expense'),
    ]

    name = models.CharField(max_length=255, unique=True)
    category_type = models.CharField(max_length=10, choices=CATEGORY_TYPE_CHOICES)
    description = models.TextField(blank=True)
    is_tax_deductible = models.BooleanField(default=False, help_text="Whether expenses in this category are tax-deductible")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Transaction Categories"
        ordering = ['category_type', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_category_type_display()})"


class Transaction(models.Model):
    """Income and expense transactions — auto-downloaded or manually entered."""
    TRANSACTION_TYPE_CHOICES = [
        ('INCOME', 'Income'),
        ('EXPENSE', 'Expense'),
        ('TRANSFER', 'Transfer'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CLEARED', 'Cleared'),
        ('RECONCILED', 'Reconciled'),
        ('VOID', 'Void'),
    ]

    bank_account = models.ForeignKey(BankAccount, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    category = models.ForeignKey(TransactionCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    date = models.DateField()
    description = models.CharField(max_length=500)
    reference = models.CharField(max_length=100, blank=True, help_text="Check number, transaction reference, etc.")
    payee = models.CharField(max_length=255, blank=True, help_text="Who was paid or who paid you")
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='CLEARED')
    is_auto_categorized = models.BooleanField(default=False, help_text="Set True when auto-categorized from bank feed")
    notes = models.TextField(blank=True)
    # Link to existing payment if this transaction relates to rent collection
    linked_payment = models.ForeignKey('payments.Payment', on_delete=models.SET_NULL, null=True, blank=True, related_name='finance_transactions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.description} - {self.amount}"


class Invoice(models.Model):
    """Professional invoices sent to tenants or clients."""
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent'),
        ('VIEWED', 'Viewed'),
        ('PAID', 'Paid'),
        ('PARTIAL', 'Partially Paid'),
        ('OVERDUE', 'Overdue'),
        ('CANCELLED', 'Cancelled'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('CREDIT_CARD', 'Credit Card'),
        ('MOBILE_MONEY', 'Mobile Money (M-Pesa)'),
        ('CASH', 'Cash'),
        ('CHECK', 'Check'),
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    client_name = models.CharField(max_length=255, blank=True, help_text="Non-tenant client name")
    client_email = models.EmailField(blank=True)
    issue_date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='DRAFT')
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), help_text="Tax percentage")
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    amount_paid = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-issue_date', '-created_at']

    def __str__(self):
        return f"Invoice #{self.invoice_number}"

    @property
    def balance_due(self):
        return self.total - self.amount_paid

    def recalculate_totals(self):
        """Recalculate subtotal, tax, and total from line items."""
        items = self.items.all()
        self.subtotal = sum(item.total for item in items)
        self.tax_amount = self.subtotal * (self.tax_rate / Decimal('100'))
        self.total = self.subtotal + self.tax_amount
        self.save()


class InvoiceItem(models.Model):
    """Line items on an invoice."""
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=500)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1.00'))
    unit_price = models.DecimalField(max_digits=14, decimal_places=2)
    total = models.DecimalField(max_digits=14, decimal_places=2)

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} x{self.quantity}"
