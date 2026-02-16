from django.db import models


class Property(models.Model):
    house_number = models.CharField(max_length=50, unique=True)
    address = models.CharField(max_length=500)
    bedrooms = models.IntegerField(default=1)
    bathrooms = models.IntegerField(default=1)
    square_feet = models.IntegerField(null=True, blank=True)
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)
    is_occupied = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Properties"
        ordering = ['house_number']

    def __str__(self):
        return f"House {self.house_number}"
    
    def get_current_tenant(self):
        """Get the current active tenant for this property"""
        return self.tenants.filter(is_active=True).first()
    
    def get_payment_history(self):
        """Get all payments for this property"""
        from payments.models import Payment
        return Payment.objects.filter(tenant__property=self).order_by('-date_due')
    
    def get_maintenance_requests(self):
        """Get all maintenance requests for this property"""
        from maintenance.models import MaintenanceRequest
        return MaintenanceRequest.objects.filter(tenant__property=self).order_by('-request_date')
    
    def get_tenant_history(self):
        """Get all tenants (current and past) for this property"""
        return self.tenants.all().order_by('-lease_start')
