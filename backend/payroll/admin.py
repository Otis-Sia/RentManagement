from django.contrib import admin
from .models import Employee, PayrollRun, Paycheck


class PaycheckInline(admin.TabularInline):
    model = Paycheck
    extra = 0
    readonly_fields = ['total_deductions', 'net_pay']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'job_title', 'employment_type', 'base_salary', 'is_active']
    list_filter = ['employment_type', 'is_active']
    search_fields = ['first_name', 'last_name', 'email']


@admin.register(PayrollRun)
class PayrollRunAdmin(admin.ModelAdmin):
    list_display = ['name', 'period_start', 'period_end', 'pay_date', 'status', 'total_net']
    list_filter = ['status']
    inlines = [PaycheckInline]


@admin.register(Paycheck)
class PaycheckAdmin(admin.ModelAdmin):
    list_display = ['employee', 'payroll_run', 'gross_pay', 'total_deductions', 'net_pay']
    readonly_fields = ['total_deductions', 'net_pay']
