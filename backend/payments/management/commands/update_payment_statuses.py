from django.core.management.base import BaseCommand
from django.utils import timezone
from payments.models import Payment
from tenants.models import Tenant
from datetime import timedelta
from django.db.models import Count, Q

class Command(BaseCommand):
    help = 'Updates payment statuses based on due dates and tenant history'

    def handle(self, *args, **options):
        today = timezone.now().date()
        self.stdout.write(f"Running payment status update for {today}")

        # 1. PENDING -> LATE (5 days after due date)
        late_threshold = today - timedelta(days=5)
        late_payments = Payment.objects.filter(
            status='PENDING',
            date_due__lt=late_threshold
        )
        count_late = late_payments.update(status='LATE')
        self.stdout.write(self.style.SUCCESS(f"Updated {count_late} payments to LATE"))

        # 2. LATE -> FAILED (35 days after due date OR 2 'LATE' payments)
        # 35 days threshold
        failed_threshold = today - timedelta(days=35)
        
        # Logic A: Time-based failure
        time_failed_payments = Payment.objects.filter(
            status__in=['PENDING', 'LATE'],
            date_due__lt=failed_threshold
        )
        count_time_failed = time_failed_payments.update(status='FAILED')
        self.stdout.write(self.style.SUCCESS(f"Updated {count_time_failed} payments to FAILED (Time-based)"))

        # Logic B: Count-based failure (2 or more LATE payments)
        # Find tenants with >= 2 LATE payments
        # We need to be careful not to double count or create a loop where everything instantly fails.
        # "It turns into Failed" - likely refers to the LATE payments themselves?
        # If a tenant has 2 LATE payments, do they ALL become FAILED?
        # Interpretation: If a tenant looks risky (>=2 Lates), escalate existing Lates to Failed.
        
        tenants_with_multiple_lates = Payment.objects.filter(status='LATE')\
            .values('tenant')\
            .annotate(late_count=Count('id'))\
            .filter(late_count__gte=2)\
            .values_list('tenant', flat=True)
            
        if tenants_with_multiple_lates:
            count_based_failed = Payment.objects.filter(
                tenant__in=tenants_with_multiple_lates,
                status='LATE'
            ).update(status='FAILED')
            self.stdout.write(self.style.SUCCESS(f"Updated {count_based_failed} payments to FAILED (Count-based)"))

        # 3. FAILED -> SEVERE (3 'FAILED' payments)
        # Find tenants with >= 3 FAILED payments
        tenants_with_severe_risk = Payment.objects.filter(status='FAILED')\
            .values('tenant')\
            .annotate(failed_count=Count('id'))\
            .filter(failed_count__gte=3)\
            .values_list('tenant', flat=True)

        if tenants_with_severe_risk:
            severe_payments = Payment.objects.filter(
                tenant__in=tenants_with_severe_risk,
                status='FAILED'
            ).update(status='SEVERE')
            self.stdout.write(self.style.SUCCESS(f"Updated {severe_payments} payments to SEVERE"))

        # 4. DEFAULTED (Inactive tenants with arrears)
        # "If a tenant is inactive they are labeled as 'Default'"
        # We interpret this as marking their outstanding payments as DEFAULTED.
        inactive_tenants = Tenant.objects.filter(is_active=False)
        if inactive_tenants.exists():
            defaulted_payments = Payment.objects.filter(
                tenant__in=inactive_tenants,
                status__in=['PENDING', 'LATE', 'FAILED', 'SEVERE']
            ).update(status='DEFAULTED')
            self.stdout.write(self.style.SUCCESS(f"Updated {defaulted_payments} payments to DEFAULTED"))
