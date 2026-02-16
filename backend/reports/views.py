from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Q
from payments.models import Payment
from maintenance.models import MaintenanceRequest
from datetime import datetime

class DashboardReportView(APIView):
    def get(self, request):
        # Monthly Income (payments paid this month)
        now = datetime.now()
        monthly_income = Payment.objects.filter(
            status='PAID',
            date_paid__year=now.year,
            date_paid__month=now.month
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Outstanding Balances (pending or late payments)
        outstanding_balance = Payment.objects.filter(
            status__in=['PENDING', 'LATE']
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Total Maintenance Costs (completed requests)
        maintenance_costs = MaintenanceRequest.objects.filter(
            status='COMPLETED'
        ).aggregate(total=Sum('cost'))['total'] or 0

        return Response({
            'monthly_income': monthly_income,
            'outstanding_balance': outstanding_balance,
            'maintenance_costs': maintenance_costs,
            'net_cash_flow': monthly_income - maintenance_costs
        })
