from django.core.management.base import BaseCommand
from django.utils import timezone
from payments.models import Payment
from payments.status import compute_status_for_tenant
from tenants.models import Tenant


class Command(BaseCommand):
    help = 'Updates payment statuses based on due dates and tenant history (single source of truth)'

    def handle(self, *args, **options):
        today = timezone.now().date()
        self.stdout.write(f"Running payment status update for {today}")

        updated_count = 0
        transitions = {}

        # Process all unpaid payments
        unpaid_payments = Payment.objects.filter(
            status__in=['PENDING', 'LATE', 'FAILED', 'SEVERE']
        ).select_related('tenant')

        for payment in unpaid_payments:
            new_status = compute_status_for_tenant(
                tenant=payment.tenant,
                date_due=payment.date_due,
                date_paid=payment.date_paid,
                payment_type=payment.payment_type,
                instance_id=payment.id,
            )

            if new_status != payment.status:
                old_status = payment.status
                payment.status = new_status
                payment.save(update_fields=['status', 'updated_at'])

                transition_key = f"{old_status} → {new_status}"
                transitions[transition_key] = transitions.get(transition_key, 0) + 1
                updated_count += 1

                self.stdout.write(
                    f"  Payment #{payment.id} ({payment.tenant.name}): "
                    f"{old_status} → {new_status}"
                )

        # Handle inactive tenants → DEFAULTED
        inactive_tenants = Tenant.objects.filter(is_active=False)
        if inactive_tenants.exists():
            defaulted_qs = Payment.objects.filter(
                tenant__in=inactive_tenants,
                status__in=['PENDING', 'LATE', 'FAILED', 'SEVERE'],
            )
            for payment in defaulted_qs:
                if payment.status != 'DEFAULTED':
                    old_status = payment.status
                    payment.status = 'DEFAULTED'
                    payment.save(update_fields=['status', 'updated_at'])

                    transition_key = f"{old_status} → DEFAULTED"
                    transitions[transition_key] = transitions.get(transition_key, 0) + 1
                    updated_count += 1

        self.stdout.write(self.style.SUCCESS(f"\nTotal updated: {updated_count}"))
        for transition, count in sorted(transitions.items()):
            self.stdout.write(f"  {transition}: {count}")
