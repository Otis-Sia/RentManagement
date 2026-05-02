from django.db import models
from django.core.validators import MinValueValidator
from django.db.models import Q
from decimal import Decimal
from tenants.models import Tenant


class Payment(models.Model):
    PAYMENT_TYPE_CHOICES = [
        ('RENT', 'Rent'),
        ('DEPOSIT', 'Security Deposit'),
        ('FEE', 'Late Fee'),
        ('OTHER', 'Other'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('LATE', 'Late'),
        ('FAILED', 'Failed'),
        ('SEVERE', 'Severe'),
        ('DEFAULTED', 'Defaulted'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('MPESA', 'M-Pesa'),
        ('CASH', 'Cash'),
        ('BANK', 'Bank Transfer'),
        ('CHEQUE', 'Cheque'),
        ('OTHER', 'Other'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT, related_name='payments')
    amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Total amount billed for this payment"
    )
    amount_paid = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal('0.00'),
        help_text="How much has actually been paid towards this payment"
    )
    original_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal('0.00'),
        help_text="Original billing amount (never mutated)"
    )
    date_due = models.DateField()
    date_paid = models.DateField(null=True, blank=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='RENT')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='CASH', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, help_text="Freeform memo or notes about this payment")
    utilization_data = models.JSONField(
        default=list, blank=True,
        help_text="JSON breakdown of how this payment was allocated"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    invoice = models.ForeignKey(
        'finance.Invoice', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='linked_payments',
        help_text="Optional link to a finance invoice"
    )

    class Meta:
        ordering = ['-date_due', '-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['transaction_id'],
                condition=Q(transaction_id__isnull=False) & ~Q(transaction_id=''),
                name='unique_non_empty_transaction_id',
            ),
        ]

    @property
    def balance(self):
        """Remaining balance = amount - amount_paid."""
        return self.amount - self.amount_paid

    def save(self, *args, **kwargs):
        # Set original_amount on first creation only
        if not self.pk and self.original_amount == Decimal('0.00'):
            self.original_amount = self.amount
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_payment_type_display()} - {self.tenant.name} - {self.amount}"
