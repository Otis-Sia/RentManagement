from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class Employee(models.Model):
    """Employees for payroll processing."""
    PAY_FREQUENCY_CHOICES = [
        ('WEEKLY', 'Weekly'),
        ('BIWEEKLY', 'Bi-Weekly'),
        ('MONTHLY', 'Monthly'),
    ]
    EMPLOYMENT_TYPE_CHOICES = [
        ('FULL_TIME', 'Full Time'),
        ('PART_TIME', 'Part Time'),
        ('CONTRACT', 'Contract'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    id_number = models.CharField(max_length=50, blank=True, help_text="National ID or tax ID")
    kra_pin = models.CharField(max_length=20, blank=True, help_text="KRA PIN for tax purposes")
    employment_type = models.CharField(max_length=15, choices=EMPLOYMENT_TYPE_CHOICES, default='FULL_TIME')
    job_title = models.CharField(max_length=255)
    department = models.CharField(max_length=100, blank=True)
    hire_date = models.DateField()
    termination_date = models.DateField(null=True, blank=True)
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, help_text="Monthly base salary")
    pay_frequency = models.CharField(max_length=10, choices=PAY_FREQUENCY_CHOICES, default='MONTHLY')
    bank_name = models.CharField(max_length=255, blank=True)
    bank_account_number = models.CharField(max_length=50, blank=True)
    nhif_number = models.CharField(max_length=30, blank=True, help_text="NHIF membership number")
    nssf_number = models.CharField(max_length=30, blank=True, help_text="NSSF membership number")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class PayrollRun(models.Model):
    """A payroll processing run for a specific period."""
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PROCESSING', 'Processing'),
        ('APPROVED', 'Approved'),
        ('PAID', 'Paid'),
        ('CANCELLED', 'Cancelled'),
    ]

    name = models.CharField(max_length=255, help_text="e.g. 'February 2026 Payroll'")
    period_start = models.DateField()
    period_end = models.DateField()
    pay_date = models.DateField(help_text="Date employees are paid")
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='DRAFT')
    total_gross = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    total_deductions = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    total_net = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    total_employer_taxes = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-period_end']

    def __str__(self):
        return self.name

    def recalculate_totals(self):
        """Recalculate totals from all paychecks in this run."""
        paychecks = self.paychecks.all()
        self.total_gross = sum(p.gross_pay for p in paychecks)
        self.total_deductions = sum(p.total_deductions for p in paychecks)
        self.total_net = sum(p.net_pay for p in paychecks)
        self.total_employer_taxes = sum(p.employer_nhif + p.employer_nssf for p in paychecks)
        self.save()


class Paycheck(models.Model):
    """Individual employee paycheck within a payroll run."""
    payroll_run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name='paychecks')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='paychecks')
    gross_pay = models.DecimalField(max_digits=12, decimal_places=2)
    # Deductions
    paye_tax = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), help_text="Pay As You Earn tax")
    nhif_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), help_text="NHIF employee contribution")
    nssf_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), help_text="NSSF employee contribution")
    housing_levy = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), help_text="Housing levy deduction")
    other_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    deduction_notes = models.CharField(max_length=500, blank=True)
    # Employer contributions
    employer_nhif = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    employer_nssf = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    # Computed
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    net_pay = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    is_direct_deposit = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['employee__last_name']
        unique_together = ['payroll_run', 'employee']

    def __str__(self):
        return f"{self.employee.full_name} - {self.payroll_run.name}"

    def calculate(self):
        """Calculate deductions and net pay based on Kenyan tax brackets."""
        gross = self.gross_pay

        # PAYE (Kenya 2024/2025 tax brackets - simplified)
        # First 24,000 KSh: 10%, Next 8,333: 25%, Above 32,333: 30%, Above 500,000: 32.5%, Above 800,000: 35%
        taxable = gross
        paye = Decimal('0.00')
        if taxable > Decimal('800000'):
            paye += (taxable - Decimal('800000')) * Decimal('0.35')
            taxable = Decimal('800000')
        if taxable > Decimal('500000'):
            paye += (taxable - Decimal('500000')) * Decimal('0.325')
            taxable = Decimal('500000')
        if taxable > Decimal('32333'):
            paye += (taxable - Decimal('32333')) * Decimal('0.30')
            taxable = Decimal('32333')
        if taxable > Decimal('24000'):
            paye += (taxable - Decimal('24000')) * Decimal('0.25')
            taxable = Decimal('24000')
        paye += taxable * Decimal('0.10')
        # Personal relief
        paye = max(paye - Decimal('2400'), Decimal('0.00'))
        self.paye_tax = paye.quantize(Decimal('0.01'))

        # NHIF (simplified tiered rates)
        if gross <= Decimal('5999'):
            self.nhif_deduction = Decimal('150')
        elif gross <= Decimal('7999'):
            self.nhif_deduction = Decimal('300')
        elif gross <= Decimal('11999'):
            self.nhif_deduction = Decimal('400')
        elif gross <= Decimal('14999'):
            self.nhif_deduction = Decimal('500')
        elif gross <= Decimal('19999'):
            self.nhif_deduction = Decimal('600')
        elif gross <= Decimal('24999'):
            self.nhif_deduction = Decimal('750')
        elif gross <= Decimal('29999'):
            self.nhif_deduction = Decimal('850')
        elif gross <= Decimal('34999'):
            self.nhif_deduction = Decimal('900')
        elif gross <= Decimal('39999'):
            self.nhif_deduction = Decimal('950')
        elif gross <= Decimal('44999'):
            self.nhif_deduction = Decimal('1000')
        elif gross <= Decimal('49999'):
            self.nhif_deduction = Decimal('1100')
        elif gross <= Decimal('59999'):
            self.nhif_deduction = Decimal('1200')
        elif gross <= Decimal('69999'):
            self.nhif_deduction = Decimal('1300')
        elif gross <= Decimal('79999'):
            self.nhif_deduction = Decimal('1400')
        elif gross <= Decimal('89999'):
            self.nhif_deduction = Decimal('1500')
        elif gross <= Decimal('99999'):
            self.nhif_deduction = Decimal('1600')
        else:
            self.nhif_deduction = Decimal('1700')

        # NSSF (Tier I + Tier II)
        tier1_limit = Decimal('7000')
        tier2_limit = Decimal('36000')
        nssf_rate = Decimal('0.06')
        if gross <= tier1_limit:
            self.nssf_deduction = gross * nssf_rate
        elif gross <= tier2_limit:
            self.nssf_deduction = tier1_limit * nssf_rate + (gross - tier1_limit) * nssf_rate
        else:
            self.nssf_deduction = tier2_limit * nssf_rate
        self.nssf_deduction = self.nssf_deduction.quantize(Decimal('0.01'))

        # Housing Levy (1.5% of gross)
        self.housing_levy = (gross * Decimal('0.015')).quantize(Decimal('0.01'))

        # Employer contributions (matched)
        self.employer_nhif = self.nhif_deduction
        self.employer_nssf = self.nssf_deduction

        # Totals
        self.total_deductions = (
            self.paye_tax + self.nhif_deduction + self.nssf_deduction +
            self.housing_levy + self.other_deductions
        )
        self.net_pay = self.gross_pay - self.total_deductions

    def save(self, *args, **kwargs):
        self.calculate()
        super().save(*args, **kwargs)
