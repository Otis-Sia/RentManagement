from django.db import models
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
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date_due = models.DateField()
    date_paid = models.DateField(null=True, blank=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='RENT')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_payment_type_display()} - {self.tenant.name} - {self.amount}"
