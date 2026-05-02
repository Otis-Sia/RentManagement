from django.db import models
from tenants.models import Tenant

class MaintenanceRequest(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('EMERGENCY', 'Emergency'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='maintenance_requests')
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    request_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.tenant.name}"
