from rest_framework import serializers
from .models import Employee, PayrollRun, Paycheck


class EmployeeSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    employment_type_display = serializers.CharField(source='get_employment_type_display', read_only=True)
    pay_frequency_display = serializers.CharField(source='get_pay_frequency_display', read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'


class PaycheckSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_bank = serializers.CharField(source='employee.bank_name', read_only=True)
    employee_account = serializers.CharField(source='employee.bank_account_number', read_only=True)

    class Meta:
        model = Paycheck
        fields = '__all__'
        read_only_fields = ['paye_tax', 'nhif_deduction', 'nssf_deduction', 'housing_levy',
                           'employer_nhif', 'employer_nssf', 'total_deductions', 'net_pay']


class PayrollRunSerializer(serializers.ModelSerializer):
    paychecks = PaycheckSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = PayrollRun
        fields = '__all__'
        read_only_fields = ['total_gross', 'total_deductions', 'total_net', 'total_employer_taxes']
