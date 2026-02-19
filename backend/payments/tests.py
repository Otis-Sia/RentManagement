from django.test import TestCase
from datetime import date, timedelta

from houses.models import Property
from tenants.models import Tenant
from payments.models import Payment
from payments.serializers import PaymentSerializer


class PaymentStatusRulesTests(TestCase):
	def setUp(self):
		self.property = Property.objects.create(
			house_number='A1',
			address='Test Avenue',
			bedrooms=2,
			bathrooms=1,
			monthly_rent='15000.00',
			is_occupied=True,
		)

		self.tenant = Tenant.objects.create(
			name='Test Tenant',
			property=self.property,
			email='tenant@example.com',
			phone='0712345678',
			lease_start=date.today() - timedelta(days=90),
			lease_end=date.today() + timedelta(days=275),
			rent_amount='15000.00',
			deposit='15000.00',
			rent_due_day=1,
			is_active=True,
		)

	def _create_payment(self, *, payment_type='RENT', days_overdue=0, with_date_paid=False):
		date_due = date.today() - timedelta(days=days_overdue)
		serializer = PaymentSerializer(data={
			'tenant': self.tenant.id,
			'amount': '15000.00',
			'date_due': date_due,
			'date_paid': date.today() if with_date_paid else None,
			'payment_type': payment_type,
		})

		self.assertTrue(serializer.is_valid(), serializer.errors)
		return serializer.save()

	def test_paid_within_five_day_grace_is_paid(self):
		payment = self._create_payment(payment_type='RENT', days_overdue=3, with_date_paid=True)
		self.assertEqual(payment.status, 'PAID')

	def test_unpaid_within_five_day_grace_is_pending(self):
		payment = self._create_payment(payment_type='RENT', days_overdue=3, with_date_paid=False)
		self.assertEqual(payment.status, 'PENDING')

	def test_first_rent_over_five_days_is_late(self):
		payment = self._create_payment(payment_type='RENT', days_overdue=6, with_date_paid=False)
		self.assertEqual(payment.status, 'LATE')

	def test_second_rent_late_escalates_to_failed(self):
		Payment.objects.create(
			tenant=self.tenant,
			amount='15000.00',
			date_due=date.today() - timedelta(days=40),
			payment_type='RENT',
			status='LATE',
		)

		payment = self._create_payment(payment_type='RENT', days_overdue=10, with_date_paid=False)
		self.assertEqual(payment.status, 'FAILED')

	def test_rent_over_thirty_five_days_is_failed(self):
		payment = self._create_payment(payment_type='RENT', days_overdue=36, with_date_paid=False)
		self.assertEqual(payment.status, 'FAILED')

	def test_rent_becomes_severe_after_three_failed(self):
		for index in range(3):
			Payment.objects.create(
				tenant=self.tenant,
				amount='15000.00',
				date_due=date.today() - timedelta(days=50 + index),
				payment_type='RENT',
				status='FAILED',
			)

		payment = self._create_payment(payment_type='RENT', days_overdue=40, with_date_paid=False)
		self.assertEqual(payment.status, 'SEVERE')

	def test_non_rent_over_thirty_five_days_stays_late(self):
		for index in range(5):
			Payment.objects.create(
				tenant=self.tenant,
				amount='500.00',
				date_due=date.today() - timedelta(days=60 + index),
				payment_type='RENT',
				status='FAILED',
			)

		payment = self._create_payment(payment_type='FEE', days_overdue=40, with_date_paid=False)
		self.assertEqual(payment.status, 'LATE')

	def test_non_rent_late_not_forced_to_failed_by_one_late_cap(self):
		Payment.objects.create(
			tenant=self.tenant,
			amount='500.00',
			date_due=date.today() - timedelta(days=20),
			payment_type='FEE',
			status='LATE',
		)

		payment = self._create_payment(payment_type='OTHER', days_overdue=12, with_date_paid=False)
		self.assertEqual(payment.status, 'LATE')
