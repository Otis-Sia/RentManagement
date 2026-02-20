from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Q, Count, F
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta, date
from decimal import Decimal
from calendar import month_abbr

from .models import BankAccount, TransactionCategory, Transaction, Invoice, InvoiceItem
from .serializers import (
    BankAccountSerializer, TransactionCategorySerializer,
    TransactionSerializer, InvoiceSerializer
)
from payments.models import Payment
from maintenance.models import MaintenanceRequest


class BankAccountViewSet(viewsets.ModelViewSet):
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer


class TransactionCategoryViewSet(viewsets.ModelViewSet):
    queryset = TransactionCategory.objects.all()
    serializer_class = TransactionCategorySerializer


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related('bank_account', 'category').all()
    serializer_class = TransactionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by type
        txn_type = self.request.query_params.get('type')
        if txn_type:
            qs = qs.filter(transaction_type=txn_type.upper())
        # Filter by category
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)
        # Filter by account
        account_id = self.request.query_params.get('account')
        if account_id:
            qs = qs.filter(bank_account_id=account_id)
        # Filter by date range
        start = self.request.query_params.get('start_date')
        end = self.request.query_params.get('end_date')
        if start:
            qs = qs.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)
        return qs

    @action(detail=False, methods=['post'])
    def auto_categorize(self, request):
        """Auto-categorize uncategorized transactions based on description keywords."""
        uncategorized = Transaction.objects.filter(category__isnull=True)
        categories = TransactionCategory.objects.all()
        categorized_count = 0

        for txn in uncategorized:
            desc_lower = txn.description.lower()
            for cat in categories:
                if cat.name.lower() in desc_lower:
                    txn.category = cat
                    txn.is_auto_categorized = True
                    txn.save()
                    categorized_count += 1
                    break

        return Response({'categorized': categorized_count})


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('tenant').prefetch_related('items').all()
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter.upper())
        return qs

    @action(detail=True, methods=['post'])
    def send_invoice(self, request, pk=None):
        """Mark invoice as sent."""
        invoice = self.get_object()
        if invoice.status == 'DRAFT':
            invoice.status = 'SENT'
            invoice.save()
        return Response(InvoiceSerializer(invoice).data)

    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        """Record a payment against an invoice."""
        invoice = self.get_object()
        amount = Decimal(str(request.data.get('amount', 0)))
        payment_method = request.data.get('payment_method', '')

        if amount <= 0:
            return Response({'error': 'Payment amount must be positive'}, status=status.HTTP_400_BAD_REQUEST)

        invoice.amount_paid += amount
        invoice.payment_method = payment_method

        if invoice.amount_paid >= invoice.total:
            invoice.status = 'PAID'
            invoice.amount_paid = invoice.total
        else:
            invoice.status = 'PARTIAL'
        invoice.save()

        return Response(InvoiceSerializer(invoice).data)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """Add a line item to an invoice."""
        invoice = self.get_object()
        description = request.data.get('description', '')
        quantity = Decimal(str(request.data.get('quantity', 1)))
        unit_price = Decimal(str(request.data.get('unit_price', 0)))

        item = InvoiceItem.objects.create(
            invoice=invoice,
            description=description,
            quantity=quantity,
            unit_price=unit_price,
            total=quantity * unit_price
        )
        invoice.recalculate_totals()

        return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)


class FinancialReportsView(APIView):
    """Generate P&L, Balance Sheet, and Cash Flow reports."""

    def get(self, request):
        report_type = request.query_params.get('type', 'pnl')
        # Default to current month
        now = datetime.now()
        year = int(request.query_params.get('year', now.year))
        month = int(request.query_params.get('month', now.month))

        if report_type == 'pnl':
            return self._profit_and_loss(year, month)
        elif report_type == 'balance_sheet':
            return self._balance_sheet()
        elif report_type == 'cash_flow':
            return self._cash_flow(year, month)
        elif report_type == 'tax_summary':
            return self._tax_summary(year)
        else:
            return Response({'error': 'Invalid report type'}, status=400)

    def _profit_and_loss(self, year, month):
        """Profit & Loss statement for a given month."""
        # Income from rent payments
        rent_income = Payment.objects.filter(
            status='PAID',
            date_paid__year=year,
            date_paid__month=month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        # Other income from transactions
        other_income = Transaction.objects.filter(
            transaction_type='INCOME',
            date__year=year,
            date__month=month,
            status__in=['CLEARED', 'RECONCILED']
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        total_income = rent_income + other_income

        # Expenses from maintenance
        maintenance_expense = MaintenanceRequest.objects.filter(
            status='COMPLETED',
            resolved_date__year=year,
            resolved_date__month=month
        ).aggregate(total=Sum('cost'))['total'] or Decimal('0')

        # Expenses from transactions
        other_expenses = Transaction.objects.filter(
            transaction_type='EXPENSE',
            date__year=year,
            date__month=month,
            status__in=['CLEARED', 'RECONCILED']
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        total_expenses = maintenance_expense + other_expenses

        # Expense breakdown by category
        expense_by_category = Transaction.objects.filter(
            transaction_type='EXPENSE',
            date__year=year,
            date__month=month,
            status__in=['CLEARED', 'RECONCILED']
        ).values('category__name').annotate(
            total=Sum('amount')
        ).order_by('-total')

        # Income breakdown by category
        income_by_category_qs = Transaction.objects.filter(
            transaction_type='INCOME',
            date__year=year,
            date__month=month,
            status__in=['CLEARED', 'RECONCILED']
        ).values('category__name').annotate(
            total=Sum('amount')
        ).order_by('-total')

        income_breakdown = [{'category': 'Rent Collections', 'amount': float(rent_income)}]
        for item in income_by_category_qs:
            income_breakdown.append({
                'category': item['category__name'] or 'Uncategorized',
                'amount': float(item['total'])
            })

        expense_breakdown = [{'category': 'Maintenance & Repairs', 'amount': float(maintenance_expense)}]
        for item in expense_by_category:
            expense_breakdown.append({
                'category': item['category__name'] or 'Uncategorized',
                'amount': float(item['total'])
            })

        net_income = total_income - total_expenses

        return Response({
            'report': 'Profit & Loss',
            'period': f"{month_abbr[month]} {year}",
            'year': year,
            'month': month,
            'total_income': float(total_income),
            'rent_income': float(rent_income),
            'other_income': float(other_income),
            'income_breakdown': income_breakdown,
            'total_expenses': float(total_expenses),
            'maintenance_expense': float(maintenance_expense),
            'other_expenses': float(other_expenses),
            'expense_breakdown': expense_breakdown,
            'net_income': float(net_income),
        })

    def _balance_sheet(self):
        """Simplified balance sheet."""
        # Assets
        bank_balances = BankAccount.objects.filter(
            is_active=True
        ).aggregate(total=Sum('balance'))['total'] or Decimal('0')

        accounts_receivable = Payment.objects.filter(
            status__in=['PENDING', 'LATE', 'FAILED', 'SEVERE']
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        invoice_receivable = Invoice.objects.filter(
            status__in=['SENT', 'VIEWED', 'PARTIAL', 'OVERDUE']
        ).aggregate(
            total=Sum(F('total') - F('amount_paid'))
        )['total'] or Decimal('0')

        total_assets = bank_balances + accounts_receivable + invoice_receivable

        # Liabilities
        tenant_deposits = Decimal('0')
        from tenants.models import Tenant
        tenant_deposits = Tenant.objects.filter(
            is_active=True
        ).aggregate(total=Sum('deposit'))['total'] or Decimal('0')

        total_liabilities = tenant_deposits

        # Equity
        equity = total_assets - total_liabilities

        # Account breakdown
        accounts = BankAccount.objects.filter(is_active=True).values(
            'name', 'account_type', 'balance'
        )

        return Response({
            'report': 'Balance Sheet',
            'as_of': date.today().isoformat(),
            'assets': {
                'bank_balances': float(bank_balances),
                'accounts_receivable': float(accounts_receivable),
                'invoice_receivable': float(invoice_receivable),
                'total': float(total_assets),
                'bank_accounts': list(accounts),
            },
            'liabilities': {
                'tenant_deposits': float(tenant_deposits),
                'total': float(total_liabilities),
            },
            'equity': float(equity),
        })

    def _cash_flow(self, year, month):
        """Cash Flow statement."""
        # Operating activities
        cash_in_rent = Payment.objects.filter(
            status='PAID',
            date_paid__year=year,
            date_paid__month=month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        cash_in_other = Transaction.objects.filter(
            transaction_type='INCOME',
            date__year=year,
            date__month=month,
            status__in=['CLEARED', 'RECONCILED']
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        cash_out_maintenance = MaintenanceRequest.objects.filter(
            status='COMPLETED',
            resolved_date__year=year,
            resolved_date__month=month
        ).aggregate(total=Sum('cost'))['total'] or Decimal('0')

        cash_out_expenses = Transaction.objects.filter(
            transaction_type='EXPENSE',
            date__year=year,
            date__month=month,
            status__in=['CLEARED', 'RECONCILED']
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        operating_cash_flow = (cash_in_rent + cash_in_other) - (cash_out_maintenance + cash_out_expenses)

        # Monthly trends (last 6 months)
        trends = []
        for i in range(5, -1, -1):
            target_month = month - i
            target_year = year
            while target_month <= 0:
                target_month += 12
                target_year -= 1

            m_income = Payment.objects.filter(
                status='PAID',
                date_paid__year=target_year,
                date_paid__month=target_month
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

            m_income += Transaction.objects.filter(
                transaction_type='INCOME',
                date__year=target_year,
                date__month=target_month,
                status__in=['CLEARED', 'RECONCILED']
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

            m_expense = Transaction.objects.filter(
                transaction_type='EXPENSE',
                date__year=target_year,
                date__month=target_month,
                status__in=['CLEARED', 'RECONCILED']
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

            m_expense += MaintenanceRequest.objects.filter(
                status='COMPLETED',
                resolved_date__year=target_year,
                resolved_date__month=target_month
            ).aggregate(total=Sum('cost'))['total'] or Decimal('0')

            trends.append({
                'month': f'{month_abbr[target_month]} {target_year}',
                'inflow': float(m_income),
                'outflow': float(m_expense),
                'net': float(m_income - m_expense),
            })

        return Response({
            'report': 'Cash Flow',
            'period': f"{month_abbr[month]} {year}",
            'year': year,
            'month': month,
            'operating': {
                'cash_in_rent': float(cash_in_rent),
                'cash_in_other': float(cash_in_other),
                'total_inflow': float(cash_in_rent + cash_in_other),
                'cash_out_maintenance': float(cash_out_maintenance),
                'cash_out_expenses': float(cash_out_expenses),
                'total_outflow': float(cash_out_maintenance + cash_out_expenses),
                'net': float(operating_cash_flow),
            },
            'trends': trends,
        })

    def _tax_summary(self, year):
        """Tax preparation summary for the year."""
        # Total income for the year
        rent_income = Payment.objects.filter(
            status='PAID',
            date_paid__year=year
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        other_income = Transaction.objects.filter(
            transaction_type='INCOME',
            date__year=year,
            status__in=['CLEARED', 'RECONCILED']
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        # Tax-deductible expenses
        deductible_expenses = Transaction.objects.filter(
            transaction_type='EXPENSE',
            date__year=year,
            status__in=['CLEARED', 'RECONCILED'],
            category__is_tax_deductible=True
        ).values('category__name').annotate(
            total=Sum('amount')
        ).order_by('-total')

        non_deductible_expenses = Transaction.objects.filter(
            transaction_type='EXPENSE',
            date__year=year,
            status__in=['CLEARED', 'RECONCILED'],
            category__is_tax_deductible=False
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        maintenance_costs = MaintenanceRequest.objects.filter(
            status='COMPLETED',
            resolved_date__year=year
        ).aggregate(total=Sum('cost'))['total'] or Decimal('0')

        total_deductible = sum(item['total'] for item in deductible_expenses) + maintenance_costs
        total_income_val = rent_income + other_income
        taxable_income = total_income_val - total_deductible

        # Monthly income breakdown
        monthly_income = []
        for m in range(1, 13):
            m_rent = Payment.objects.filter(
                status='PAID',
                date_paid__year=year,
                date_paid__month=m
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
            m_other = Transaction.objects.filter(
                transaction_type='INCOME',
                date__year=year,
                date__month=m,
                status__in=['CLEARED', 'RECONCILED']
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
            monthly_income.append({
                'month': month_abbr[m],
                'rent': float(m_rent),
                'other': float(m_other),
                'total': float(m_rent + m_other),
            })

        deductible_list = [{'category': 'Maintenance & Repairs', 'amount': float(maintenance_costs)}]
        for item in deductible_expenses:
            deductible_list.append({
                'category': item['category__name'] or 'Uncategorized',
                'amount': float(item['total']),
            })

        return Response({
            'report': 'Tax Summary',
            'year': year,
            'total_income': float(total_income_val),
            'rent_income': float(rent_income),
            'other_income': float(other_income),
            'total_deductible_expenses': float(total_deductible),
            'deductible_breakdown': deductible_list,
            'non_deductible_expenses': float(non_deductible_expenses),
            'maintenance_costs': float(maintenance_costs),
            'taxable_income': float(taxable_income),
            'monthly_income': monthly_income,
        })
