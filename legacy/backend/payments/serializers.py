from datetime import date
from decimal import Decimal
from rest_framework import serializers

from .models import Payment
from .status import compute_status_for_tenant


class PaymentSerializer(serializers.ModelSerializer):
    # ── Write-only control fields ───────────────────────────────────────────
    clear_arrears_payment_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    clear_failed_payment_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    all_inclusive = serializers.BooleanField(write_only=True, required=False, default=False)

    # ── Read-only convenience fields ────────────────────────────────────────
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    tenant_phone = serializers.CharField(source='tenant.phone', read_only=True)
    house_number = serializers.CharField(source='tenant.property.house_number', read_only=True)
    house_id = serializers.IntegerField(source='tenant.property.id', read_only=True)
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['status', 'original_amount', 'balance', 'utilization_data']

    # ── Arrears helpers (use amount_paid, never mutate amount) ──────────────

    def _apply_payment_to_single_arrears(self, payment, arrears_payment):
        """Apply payment's amount to a single arrears record using amount_paid tracking.
        Returns allocation dict describing how money was applied."""
        paid_amount = Decimal(str(payment.amount or 0))
        arrears_remaining = arrears_payment.amount - arrears_payment.amount_paid
        applied = min(paid_amount, arrears_remaining)

        if paid_amount >= arrears_remaining:
            # Fully clear the arrears
            arrears_payment.amount_paid = arrears_payment.amount
            arrears_payment.date_paid = payment.date_paid or date.today()
            arrears_payment.status = 'PAID'
            if payment.transaction_id and not arrears_payment.transaction_id:
                arrears_payment.transaction_id = payment.transaction_id
            arrears_payment.save(update_fields=['amount_paid', 'date_paid', 'status', 'transaction_id'])
        else:
            # Partial — increment amount_paid, keep original amount intact
            arrears_payment.amount_paid += paid_amount
            arrears_payment.save(update_fields=['amount_paid'])

        return {
            'description': f"{arrears_payment.get_payment_type_display()} arrears (due {arrears_payment.date_due.isoformat()})",
            'payment_id': arrears_payment.id,
            'amount_applied': str(applied),
            'status': 'Fully cleared' if paid_amount >= arrears_remaining else 'Partially paid',
            'original_amount': str(arrears_payment.amount),
            'date_due': arrears_payment.date_due.isoformat(),
        }

    def _apply_payment_to_all_arrears(self, payment):
        """Iterate oldest-first through all overdue payments, clearing until amount exhausted.
        Returns (remaining_amount, allocations_list)."""
        remaining_amount = Decimal(str(payment.amount or 0))
        allocations = []
        if remaining_amount <= 0:
            return remaining_amount, allocations

        arrears_payments = Payment.objects.filter(
            tenant=payment.tenant,
            status__in=['LATE', 'FAILED', 'SEVERE', 'DEFAULTED', 'PENDING']
        ).exclude(id=payment.id).order_by('date_due', 'id')

        for arrears_payment in arrears_payments:
            if remaining_amount <= 0:
                break

            arrears_remaining = arrears_payment.amount - arrears_payment.amount_paid
            if arrears_remaining <= 0:
                continue

            applied = min(remaining_amount, arrears_remaining)

            if remaining_amount >= arrears_remaining:
                # Fully clear this arrears
                arrears_payment.amount_paid = arrears_payment.amount
                arrears_payment.date_paid = payment.date_paid or date.today()
                arrears_payment.status = 'PAID'
                if payment.transaction_id and not arrears_payment.transaction_id:
                    arrears_payment.transaction_id = payment.transaction_id
                arrears_payment.save(update_fields=['amount_paid', 'date_paid', 'status', 'transaction_id'])
                remaining_amount -= arrears_remaining
            else:
                # Partial payment — increment amount_paid only
                arrears_payment.amount_paid += remaining_amount
                arrears_payment.save(update_fields=['amount_paid'])
                remaining_amount = Decimal('0')

            allocations.append({
                'description': f"{arrears_payment.get_payment_type_display()} arrears (due {arrears_payment.date_due.isoformat()})",
                'payment_id': arrears_payment.id,
                'amount_applied': str(applied),
                'status': 'Fully cleared' if applied >= (arrears_payment.amount - (arrears_payment.amount_paid - applied)) else 'Partially paid',
                'original_amount': str(arrears_payment.amount),
                'date_due': arrears_payment.date_due.isoformat(),
            })

            if remaining_amount <= 0:
                break

        return remaining_amount, allocations  # leftover (overpayment / credit)

    # ── Validation ──────────────────────────────────────────────────────────

    def validate(self, data):
        """Auto-compute status; enforce business rules."""
        date_due = data.get('date_due')
        date_paid = data.get('date_paid')
        tenant = data.get('tenant') or getattr(self.instance, 'tenant', None)
        payment_type = data.get('payment_type') or getattr(self.instance, 'payment_type', 'RENT')

        if not date_due:
            if self.instance:
                date_due = self.instance.date_due
            else:
                raise serializers.ValidationError({"date_due": "Date due is required."})

        if not date_paid and self.instance and 'date_paid' not in data:
            date_paid = self.instance.date_paid

        # Reject future date_paid
        if date_paid and date_paid > date.today():
            raise serializers.ValidationError({"date_paid": "Date paid cannot be in the future."})

        # Reject payments for inactive tenants (new records only)
        if not self.instance and tenant and not tenant.is_active:
            raise serializers.ValidationError({"tenant": "Cannot create payments for an inactive tenant."})

        # Auto-compute status
        data['status'] = compute_status_for_tenant(
            tenant=tenant,
            date_due=date_due,
            date_paid=date_paid,
            payment_type=payment_type,
            instance_id=getattr(self.instance, 'id', None),
        )

        # ── Arrears clearing validation ──────────────────────────────────
        clear_arrears_payment_id = data.get('clear_arrears_payment_id')
        clear_failed_payment_id = data.get('clear_failed_payment_id')
        all_inclusive = bool(data.get('all_inclusive', False))
        selected_clear_payment_id = (
            clear_arrears_payment_id if clear_arrears_payment_id is not None
            else clear_failed_payment_id
        )

        if all_inclusive and payment_type != 'RENT':
            raise serializers.ValidationError({
                "all_inclusive": "All-inclusive payment is only available for rent payments."
            })

        if selected_clear_payment_id is not None:
            if not date_paid:
                raise serializers.ValidationError({
                    "date_paid": "Date paid is required when clearing an arrears payment."
                })
            if not tenant:
                raise serializers.ValidationError({
                    "tenant": "Tenant is required when clearing an arrears payment."
                })
            arrears_payment = Payment.objects.filter(
                id=selected_clear_payment_id,
                tenant=tenant,
                status__in=['LATE', 'FAILED', 'SEVERE', 'DEFAULTED'],
            ).first()
            if not arrears_payment:
                raise serializers.ValidationError({
                    "clear_arrears_payment_id": "Selected arrears payment does not exist for this tenant."
                })
            data['clear_arrears_payment_id'] = selected_clear_payment_id

        elif all_inclusive:
            if not date_paid:
                raise serializers.ValidationError({
                    "date_paid": "Date paid is required when using all-inclusive payment."
                })
            if not tenant:
                raise serializers.ValidationError({
                    "tenant": "Tenant is required when using all-inclusive payment."
                })
            data['all_inclusive'] = True

        return data

    # ── Create / Update ────────────────────────────────────────────────────

    def create(self, validated_data):
        clear_arrears_payment_id = validated_data.pop('clear_arrears_payment_id', None)
        validated_data.pop('clear_failed_payment_id', None)
        all_inclusive = bool(validated_data.pop('all_inclusive', False))
        selected_clear_payment_id = clear_arrears_payment_id

        # Set amount_paid for PAID payments
        if validated_data.get('status') == 'PAID':
            validated_data.setdefault('amount_paid', validated_data.get('amount', Decimal('0')))

        payment = super().create(validated_data)

        allocations = []

        if selected_clear_payment_id is not None:
            arrears_payment = Payment.objects.filter(
                id=selected_clear_payment_id,
                tenant=payment.tenant,
                status__in=['LATE', 'FAILED', 'SEVERE', 'DEFAULTED'],
            ).first()
            if arrears_payment:
                allocation = self._apply_payment_to_single_arrears(payment, arrears_payment)
                allocations.append(allocation)
        elif all_inclusive and payment.payment_type == 'RENT':
            leftover, arrears_allocations = self._apply_payment_to_all_arrears(payment)
            allocations.extend(arrears_allocations)
            # Store overpayment as tenant credit
            if leftover > 0 and hasattr(payment.tenant, 'credit_balance'):
                payment.tenant.credit_balance += leftover
                payment.tenant.save(update_fields=['credit_balance'])
            if leftover > 0:
                allocations.append({
                    'description': 'Overpayment / Credit',
                    'amount_applied': str(leftover),
                    'status': 'Credit balance',
                })

        # If no arrears were cleared, the full amount goes to this payment
        if not allocations:
            allocations.append({
                'description': f"{payment.get_payment_type_display()} for {payment.date_due.strftime('%B %Y')}",
                'amount_applied': str(payment.amount),
                'status': payment.get_status_display(),
                'date_due': payment.date_due.isoformat(),
            })

        # Save utilization data
        payment.utilization_data = allocations
        payment.save(update_fields=['utilization_data'])

        return payment

    def update(self, instance, validated_data):
        clear_arrears_payment_id = validated_data.pop('clear_arrears_payment_id', None)
        validated_data.pop('clear_failed_payment_id', None)
        all_inclusive = bool(validated_data.pop('all_inclusive', False))
        selected_clear_payment_id = clear_arrears_payment_id

        # Update amount_paid if becoming PAID
        if validated_data.get('status') == 'PAID' and instance.status != 'PAID':
            validated_data.setdefault('amount_paid', validated_data.get('amount', instance.amount))

        payment = super().update(instance, validated_data)

        allocations = []

        if selected_clear_payment_id is not None:
            arrears_payment = Payment.objects.filter(
                id=selected_clear_payment_id,
                tenant=payment.tenant,
                status__in=['LATE', 'FAILED', 'SEVERE', 'DEFAULTED'],
            ).first()
            if arrears_payment:
                allocation = self._apply_payment_to_single_arrears(payment, arrears_payment)
                allocations.append(allocation)
        elif all_inclusive and payment.payment_type == 'RENT':
            leftover, arrears_allocations = self._apply_payment_to_all_arrears(payment)
            allocations.extend(arrears_allocations)
            if leftover > 0 and hasattr(payment.tenant, 'credit_balance'):
                payment.tenant.credit_balance += leftover
                payment.tenant.save(update_fields=['credit_balance'])
            if leftover > 0:
                allocations.append({
                    'description': 'Overpayment / Credit',
                    'amount_applied': str(leftover),
                    'status': 'Credit balance',
                })

        if not allocations:
            allocations.append({
                'description': f"{payment.get_payment_type_display()} for {payment.date_due.strftime('%B %Y')}",
                'amount_applied': str(payment.amount),
                'status': payment.get_status_display(),
                'date_due': payment.date_due.isoformat(),
            })

        payment.utilization_data = allocations
        payment.save(update_fields=['utilization_data'])

        return payment
