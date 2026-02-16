from django.db import models


class Tenant(models.Model):
    name = models.CharField(max_length=255)
    property = models.ForeignKey('houses.Property', on_delete=models.SET_NULL, null=True, blank=True, related_name='tenants')
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    lease_start = models.DateField()
    lease_end = models.DateField()
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class LeaseDocument(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='leases')
    document = models.FileField(upload_to='leases/')
    signed_date = models.DateField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lease for {self.tenant.name}"
