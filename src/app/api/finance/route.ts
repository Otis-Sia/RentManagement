import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30';
        
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - parseInt(range));

        // Total Revenue
        const { data: revenue } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'PAID')
            .gte('date_paid', startDate.toISOString());

        const totalRevenue = revenue?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // Arrears
        const { data: arrears } = await supabase
            .from('payments')
            .select('amount')
            .in('status', ['LATE', 'FAILED', 'SEVERE', 'DEFAULTED']);

        const totalArrears = arrears?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // Upcoming
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        const { data: upcoming } = await supabase
            .from('payments')
            .select('amount')
            .neq('status', 'PAID')
            .gte('date_due', now.toISOString())
            .lte('date_due', nextWeek.toISOString());

        const totalUpcoming = upcoming?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // Recent Transactions
        const { data: transactions } = await supabase
            .from('payments')
            .select(`
                id,
                amount,
                date_paid,
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
            .eq('status', 'PAID')
            .order('date_paid', { ascending: false })
            .limit(20);

        const recentTransactions = transactions?.map((t: any) => ({
            id: t.id,
            date: t.date_paid,
            tenant_name: t.tenants?.name,
            property: t.tenants?.properties?.house_number,
            method: t.payment_type,
            amount: t.amount,
            status: 'Completed'
        })) || [];

        return NextResponse.json({
            totalRevenue,
            totalArrears,
            totalUpcoming,
            recentTransactions
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
