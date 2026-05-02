from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction

from .models import Employee, PayrollRun, Paycheck
from .serializers import EmployeeSerializer, PayrollRunSerializer, PaycheckSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        active_only = self.request.query_params.get('active')
        if active_only == 'true':
            qs = qs.filter(is_active=True)
        return qs


class PayrollRunViewSet(viewsets.ModelViewSet):
    queryset = PayrollRun.objects.prefetch_related('paychecks__employee').all()
    serializer_class = PayrollRunSerializer

    @action(detail=True, methods=['post'])
    def generate_paychecks(self, request, pk=None):
        """Generate paychecks for all active employees in this payroll run."""
        payroll_run = self.get_object()
        if payroll_run.status != 'DRAFT':
            return Response(
                {'error': 'Can only generate paychecks for DRAFT payroll runs'},
                status=status.HTTP_400_BAD_REQUEST
            )

        active_employees = Employee.objects.filter(is_active=True)
        created = 0

        with transaction.atomic():
            for emp in active_employees:
                if not payroll_run.paychecks.filter(employee=emp).exists():
                    Paycheck.objects.create(
                        payroll_run=payroll_run,
                        employee=emp,
                        gross_pay=emp.base_salary,
                    )
                    created += 1

            payroll_run.status = 'PROCESSING'
            payroll_run.recalculate_totals()

        return Response({
            'message': f'Generated {created} paychecks',
            'payroll': PayrollRunSerializer(payroll_run).data
        })

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a payroll run."""
        payroll_run = self.get_object()
        if payroll_run.status not in ('PROCESSING', 'DRAFT'):
            return Response(
                {'error': 'Can only approve PROCESSING or DRAFT payroll runs'},
                status=status.HTTP_400_BAD_REQUEST
            )
        payroll_run.status = 'APPROVED'
        payroll_run.save()
        return Response(PayrollRunSerializer(payroll_run).data)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark payroll run as paid (direct deposits processed)."""
        payroll_run = self.get_object()
        if payroll_run.status != 'APPROVED':
            return Response(
                {'error': 'Can only mark APPROVED payroll runs as paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        payroll_run.status = 'PAID'
        payroll_run.save()
        return Response(PayrollRunSerializer(payroll_run).data)


class PaycheckViewSet(viewsets.ModelViewSet):
    queryset = Paycheck.objects.select_related('employee', 'payroll_run').all()
    serializer_class = PaycheckSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        payroll_id = self.request.query_params.get('payroll_run')
        if payroll_id:
            qs = qs.filter(payroll_run_id=payroll_id)
        employee_id = self.request.query_params.get('employee')
        if employee_id:
            qs = qs.filter(employee_id=employee_id)
        return qs
