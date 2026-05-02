import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        // Monthly Income (Paid payments this month)
        const startOfMonth = new Date(year, month - 1, 1).toISOString();
        const endOfMonth = new Date(year, month, 0).toISOString();

        const { data: monthlyPayments } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'PAID')
            .gte('date_paid', startOfMonth)
            .lte('date_paid', endOfMonth);

        const monthlyIncome = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // Outstanding Balance
        const { data: outstandingPayments } = await supabase
            .from('payments')
            .select('amount')
            .in('status', ['PENDING', 'LATE', 'FAILED', 'SEVERE', 'DEFAULTED']);

        const outstandingBalance = outstandingPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // Maintenance Costs
        const { data: maintenanceWork } = await supabase
            .from('maintenance_requests')
            .select('cost')
            .eq('status', 'COMPLETED');

        const maintenanceCosts = maintenanceWork?.reduce((sum, m) => sum + Number(m.cost || 0), 0) || 0;

        // Recent Payments
        const { data: recentPayments } = await supabase
            .from('payments')
            .select(`
                id,
                amount,
                date_paid,
                date_due,
                status,
                payment_type,
                tenants (
                    id,
                    name,
                    properties (
                        id,
                        house_number
                    )
                )
            `)
            .order('date_paid', { ascending: false })
            .limit(10);

        const recentPaymentsData = recentPayments?.map((p: any) => ({
            id: p.id,
            tenant_id: p.tenants?.id,
            tenant_name: p.tenants?.name,
            property_id: p.tenants?.properties?.id,
            property: p.tenants?.properties?.house_number || 'N/A',
            amount: p.amount,
            date_paid: p.date_paid,
            date_due: p.date_due,
            status: p.status,
            payment_type: p.payment_type
        })) || [];

        // Upcoming Due Payments
        const { data: upcomingDue } = await supabase
            .from('payments')
            .select(`
                id,
                amount,
                date_due,
                status,
                tenants (
                    id,
                    name,
                    properties (
                        id,
                        house_number
                    )
                )
            `)
            .gte('date_due', now.toISOString())
            .neq('status', 'PAID')
            .order('date_due', { ascending: true })
            .limit(10);

        const upcomingPaymentsData = upcomingDue?.map((p: any) => ({
            id: p.id,
            tenant_id: p.tenants?.id,
            tenant_name: p.tenants?.name,
            property_id: p.tenants?.properties?.id,
            property: p.tenants?.properties?.house_number || 'N/A',
            amount: p.amount,
            date_due: p.date_due,
            status: p.status
        })) || [];

        // Maintenance by Status
        const { data: maintByStatus } = await supabase
            .from('maintenance_requests')
            .select('status');
        
        const maintenanceByStatus: Record<string, number> = {};
        maintByStatus?.forEach(m => {
            maintenanceByStatus[m.status] = (maintenanceByStatus[m.status] || 0) + 1;
        });

        // Active Maintenance
        const { data: activeMaint } = await supabase
            .from('maintenance_requests')
            .select(`
                id,
                title,
                priority,
                status,
                request_date,
                cost,
                tenants (
                    id,
                    name,
                    properties (
                        id,
                        house_number
                    )
                )
            `)
            .in('status', ['OPEN', 'IN_PROGRESS'])
            .order('request_date', { ascending: false })
            .limit(10);

        const activeMaintData = activeMaint?.map((m: any) => ({
            id: m.id,
            title: m.title,
            tenant_id: m.tenants?.id,
            tenant_name: m.tenants?.name,
            property_id: m.tenants?.properties?.id,
            property: m.tenants?.properties?.house_number || 'N/A',
            priority: m.priority,
            status: m.status,
            request_date: m.request_date,
            cost: m.cost
        })) || [];

        // Payment Trends (last 6 months)
        const paymentTrends = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(year, month - 1 - i, 1);
            const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
            const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();

            const { data: trendPayments } = await supabase
                .from('payments')
                .select('amount')
                .eq('status', 'PAID')
                .gte('date_paid', mStart)
                .lte('date_paid', mEnd);

            const income = trendPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
            const monthName = d.toLocaleString('default', { month: 'short' });
            paymentTrends.push({
                month: `${monthName} ${d.getFullYear()}`,
                income: income
            });
        }

        // Payment Status Distribution
        const { data: statusDist } = await supabase
            .from('payments')
            .select('status');
        
        const paymentStatusDistribution: Record<string, number> = {};
        statusDist?.forEach(p => {
            paymentStatusDistribution[p.status] = (paymentStatusDistribution[p.status] || 0) + 1;
        });

        // Property Occupancy
        const { data: allProperties } = await supabase
            .from('properties')
            .select('id, is_occupied');
        
        const totalProperties = allProperties?.length || 0;
        const occupiedProperties = allProperties?.filter(p => p.is_occupied).length || 0;
        const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;

        return NextResponse.json({
            monthly_income: monthlyIncome,
            outstanding_balance: outstandingBalance,
            maintenance_costs: maintenanceCosts,
            net_cash_flow: monthlyIncome - maintenanceCosts,
            recent_payments: recentPaymentsData,
            upcoming_payments: upcomingPaymentsData,
            maintenance_by_status: maintenanceByStatus,
            active_maintenance: activeMaintData,
            payment_trends: paymentTrends,
            payment_status_distribution: paymentStatusDistribution,
            occupancy: {
                total: totalProperties,
                occupied: occupiedProperties,
                rate: Number(occupancyRate.toFixed(1))
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
