# Sample Data Quick Reference

## Quick Stats

Run these Django shell commands to explore the generated data:

```bash
cd backend
source venv/bin/activate
python manage.py shell
```

## Useful Queries

### Properties

```python
from houses.models import Property
from tenants.models import Tenant
from payments.models import Payment
from maintenance.models import MaintenanceRequest

# All properties
Property.objects.count()  # 60

# Occupied vs vacant
Property.objects.filter(is_occupied=True).count()  # ~36
Property.objects.filter(is_occupied=False).count()  # ~24

# Properties by address
Property.objects.values('address').annotate(count=Count('id'))

# Most expensive properties
Property.objects.order_by('-monthly_rent')[:5]

# Building A properties
Property.objects.filter(house_number__startswith='A')

# Large properties (3+ bedrooms)
Property.objects.filter(bedrooms__gte=3)
```

### Tenants

```python
# Active tenants
Tenant.objects.filter(is_active=True).count()

# Tenants with upcoming lease expiration (within 30 days)
from django.utils import timezone
from datetime import timedelta
cutoff = timezone.now().date() + timedelta(days=30)
Tenant.objects.filter(is_active=True, lease_end__lte=cutoff)

# Highest paying tenants
Tenant.objects.filter(is_active=True).order_by('-rent_amount')[:5]

# Tenants in Building C
Property.objects.filter(house_number__startswith='C').first().tenants.all()
```

### Payments

```python
# Failed payments (need attention!)
Payment.objects.filter(status='FAILED')

# Late payments
Payment.objects.filter(status='LATE')

# Pending future payments
Payment.objects.filter(status='PENDING')

# Total revenue collected
from django.db.models import Sum
Payment.objects.filter(status='PAID').aggregate(Sum('amount'))

# Recent payments (last 7 days)
from django.utils import timezone
recent = timezone.now() - timedelta(days=7)
Payment.objects.filter(date_paid__gte=recent)

# Tenant with most failed payments
from django.db.models import Count
Payment.objects.filter(status='FAILED').values('tenant__name').annotate(
    failed_count=Count('id')
).order_by('-failed_count')
```

### Maintenance

```python
# Emergency requests
MaintenanceRequest.objects.filter(priority='EMERGENCY')

# Open requests needing attention
MaintenanceRequest.objects.filter(status='OPEN')

# High-cost maintenance work
MaintenanceRequest.objects.filter(cost__isnull=False).order_by('-cost')[:5]

# Maintenance requests by priority
MaintenanceRequest.objects.values('priority').annotate(count=Count('id'))

# Requests still in progress
MaintenanceRequest.objects.filter(status='IN_PROGRESS')

# Total maintenance costs
MaintenanceRequest.objects.filter(cost__isnull=False).aggregate(Sum('cost'))
```

### Complex Queries

```python
# Properties with failed payments
properties_with_issues = Property.objects.filter(
    tenants__payments__status='FAILED'
).distinct()

# Tenants with both late payments and open maintenance requests
problematic_tenants = Tenant.objects.filter(
    payments__status='LATE',
    maintenance_requests__status='OPEN'
).distinct()

# Revenue by building
from django.db.models import Sum, Q
for letter in ['A', 'B', 'C', 'D', 'E', 'F']:
    revenue = Payment.objects.filter(
        status='PAID',
        tenant__property__house_number__startswith=letter
    ).aggregate(Sum('amount'))
    print(f"Building {letter}: KSh {revenue['amount__sum']}")

# Properties with high maintenance costs
from django.db.models import Sum
properties_high_maintenance = Property.objects.annotate(
    total_maintenance=Sum('tenants__maintenance_requests__cost')
).filter(total_maintenance__gt=10000).order_by('-total_maintenance')

# Payment collection rate
total_due = Payment.objects.exclude(status='PENDING').count()
paid = Payment.objects.filter(status='PAID').count()
print(f"Collection Rate: {(paid/total_due)*100:.1f}%")
```

## Example Data Points

### Sample Property
```
House Number: A5
Address: 123 Mombasa Road, Nairobi
Bedrooms: 2
Bathrooms: 1
Square Feet: 850
Monthly Rent: KSh 32,000
Occupied: Yes/No
```

### Sample Tenant
```
Name: James Kamau
Email: james.kamau@example.com
Phone: +254712345678
Property: B3
Lease: Jan 15, 2025 - Jan 14, 2026
Rent: KSh 28,000/month
Deposit: KSh 56,000
Rent Due: 5th of month
```

### Sample Scenario: Problem Tenant Alert
Find tenants with multiple issues:
```python
from django.db.models import Count, Q

problem_tenants = Tenant.objects.annotate(
    failed_payments=Count('payments', filter=Q(payments__status='FAILED')),
    late_payments=Count('payments', filter=Q(payments__status='LATE')),
    open_maintenance=Count('maintenance_requests', filter=Q(maintenance_requests__status='OPEN'))
).filter(
    Q(failed_payments__gte=2) | 
    Q(late_payments__gte=3) | 
    Q(open_maintenance__gte=2)
)

for tenant in problem_tenants:
    print(f"{tenant.name} - {tenant.property.house_number}")
    print(f"  Failed: {tenant.failed_payments}, Late: {tenant.late_payments}, Maint: {tenant.open_maintenance}")
```
