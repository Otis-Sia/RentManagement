from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Q, Count
from payments.models import Payment
from maintenance.models import MaintenanceRequest
from houses.models import Property
from datetime import datetime, timedelta

class DashboardReportView(APIView):
    def get(self, request):
        # Monthly Income (payments paid this month)
        now = datetime.now()
        monthly_income = Payment.objects.filter(
            status='PAID',
            date_paid__year=now.year,
            date_paid__month=now.month
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Outstanding Balances (all unpaid/overdue payments)
        outstanding_balance = Payment.objects.filter(
            status__in=['PENDING', 'LATE', 'FAILED', 'SEVERE']
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Total Maintenance Costs (completed requests)
        maintenance_costs = MaintenanceRequest.objects.filter(
            status='COMPLETED'
        ).aggregate(total=Sum('cost'))['total'] or 0

        # Recent Payments (last 10)
        recent_payments = Payment.objects.select_related('tenant', 'tenant__property').order_by('-created_at')[:10]
        recent_payments_data = [{
            'id': p.id,
            'tenant_id': p.tenant.id,
            'tenant_name': p.tenant.name,
            'property_id': p.tenant.property.id if p.tenant.property else None,
            'property': f"{p.tenant.property.house_number}" if p.tenant.property else 'N/A',
            'amount': float(p.amount),
            'date_paid': p.date_paid.isoformat() if p.date_paid else None,
            'date_due': p.date_due.isoformat(),
            'status': p.status,
            'payment_type': p.payment_type
        } for p in recent_payments]

        # Upcoming Due Payments (next 10)
        upcoming_payments = Payment.objects.filter(
            status__in=['PENDING', 'LATE'],
            date_due__gte=now.date()
        ).select_related('tenant', 'tenant__property').order_by('date_due')[:10]
        upcoming_payments_data = [{
            'id': p.id,
            'tenant_id': p.tenant.id,
            'tenant_name': p.tenant.name,
            'property_id': p.tenant.property.id if p.tenant.property else None,
            'property': f"{p.tenant.property.house_number}" if p.tenant.property else 'N/A',
            'amount': float(p.amount),
            'date_due': p.date_due.isoformat(),
            'status': p.status
        } for p in upcoming_payments]

        # Maintenance Requests by Status
        maintenance_by_status = MaintenanceRequest.objects.values('status').annotate(
            count=Count('id')
        )
        maintenance_status_data = {item['status']: item['count'] for item in maintenance_by_status}

        # Active Maintenance Requests (open and in progress)
        active_maintenance = MaintenanceRequest.objects.filter(
            status__in=['OPEN', 'IN_PROGRESS']
        ).select_related('tenant', 'tenant__property').order_by('-priority', '-request_date')[:10]
        active_maintenance_data = [{
            'id': m.id,
            'title': m.title,
            'tenant_id': m.tenant.id,
            'tenant_name': m.tenant.name,
            'property_id': m.tenant.property.id if m.tenant.property else None,
            'property': f"{m.tenant.property.house_number}" if m.tenant.property else 'N/A',
            'priority': m.priority,
            'status': m.status,
            'request_date': m.request_date.isoformat(),
            'cost': float(m.cost) if m.cost else None
        } for m in active_maintenance]

        # Payment Trends (last 6 months)
        payment_trends = []
        for i in range(5, -1, -1):
            # Calculate the month by subtracting months manually
            target_month = now.month - i
            target_year = now.year
            
            # Handle year rollover
            while target_month <= 0:
                target_month += 12
                target_year -= 1
            
            month_income = Payment.objects.filter(
                status='PAID',
                date_paid__year=target_year,
                date_paid__month=target_month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            # Create a date for formatting
            from calendar import month_abbr
            month_name = month_abbr[target_month]
            
            payment_trends.append({
                'month': f'{month_name} {target_year}',
                'income': float(month_income)
            })

        # Payment Status Distribution
        payment_status_dist = Payment.objects.values('status').annotate(
            count=Count('id')
        )
        payment_status_data = {item['status']: item['count'] for item in payment_status_dist}

        # Property Occupancy
        total_properties = Property.objects.count()
        occupied_properties = Property.objects.filter(is_occupied=True).count()
        occupancy_rate = (occupied_properties / total_properties * 100) if total_properties > 0 else 0

        return Response({
            'monthly_income': monthly_income,
            'outstanding_balance': outstanding_balance,
            'maintenance_costs': maintenance_costs,
            'net_cash_flow': monthly_income - maintenance_costs,
            'recent_payments': recent_payments_data,
            'upcoming_payments': upcoming_payments_data,
            'maintenance_by_status': maintenance_status_data,
            'active_maintenance': active_maintenance_data,
            'payment_trends': payment_trends,
            'payment_status_distribution': payment_status_data,
            'occupancy': {
                'total': total_properties,
                'occupied': occupied_properties,
                'rate': round(occupancy_rate, 1)
            }
        })
