"""
Single source of truth for payment status computation.

Used by:
  - PaymentSerializer (real-time, on create/update)
  - update_payment_statuses management command (batch, scheduled)
"""
from datetime import date

# ── Thresholds ──────────────────────────────────────────────────────────────
LATE_AFTER_DAYS = 5
FAILED_AFTER_DAYS = 35
DEFAULTED_AFTER_DAYS = 90
MAX_RENT_FAILED_BEFORE_SEVERE = 2   # >= this many existing FAILED rent → SEVERE


def compute_base_status(date_due, date_paid):
    """
    Compute status from dates alone (no tenant history).
    Returns one of: PAID, PENDING, LATE, FAILED, DEFAULTED.
    """
    reference_date = date_paid or date.today()
    overdue_days = (reference_date - date_due).days

    # Not overdue at all
    if overdue_days <= 0:
        return 'PAID' if date_paid else 'PENDING'

    # Paid (even if late) → always PAID
    if date_paid:
        return 'PAID'

    # Unpaid escalation ladder
    if overdue_days > DEFAULTED_AFTER_DAYS:
        return 'DEFAULTED'
    if overdue_days > FAILED_AFTER_DAYS:
        return 'FAILED'
    if overdue_days > LATE_AFTER_DAYS:
        return 'LATE'

    return 'PENDING'


def compute_status_for_tenant(*, tenant, date_due, date_paid, payment_type, instance_id=None):
    """
    Compute status taking tenant payment history into account.

    Escalation rules:
      LATE  → FAILED  if tenant already has another LATE payment
      FAILED → SEVERE if tenant has >= MAX_RENT_FAILED_BEFORE_SEVERE other FAILED rent payments

    Parameters
    ----------
    tenant       : Tenant instance (or None)
    date_due     : date
    date_paid    : date or None
    payment_type : str  ('RENT', 'DEPOSIT', 'FEE', 'OTHER')
    instance_id  : int or None – exclude this payment's own ID when counting
    """
    from .models import Payment   # deferred import to avoid circular

    status = compute_base_status(date_due, date_paid)

    if status in ('PAID', 'PENDING') or not tenant:
        return status

    # LATE → FAILED if another LATE exists for this tenant
    if status == 'LATE':
        existing_late_qs = Payment.objects.filter(
            tenant=tenant,
            status='LATE',
        )
        if instance_id:
            existing_late_qs = existing_late_qs.exclude(id=instance_id)
        if existing_late_qs.exists():
            status = 'FAILED'

    # FAILED → SEVERE if enough FAILED rent payments exist
    if status == 'FAILED' and payment_type == 'RENT':
        existing_failed_count = Payment.objects.filter(
            tenant=tenant,
            status='FAILED',
            payment_type='RENT',
        ).exclude(id=instance_id).count()

        if existing_failed_count >= MAX_RENT_FAILED_BEFORE_SEVERE:
            status = 'SEVERE'

    return status
