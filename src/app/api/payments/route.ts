import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
    splitRentPayment,
    computePaymentStatus,
    extractCoveredMonths,
    type MonthSlot,
} from '@/lib/rentSplit';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('payments')
            .select(`
                *,
                tenants (
                    id,
                    name,
                    properties (
                        id,
                        house_number
                    )
                )
            `)
            .order('date_due', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // ── Non-RENT payments: save as-is ───────────────────────────────────
        if (body.payment_type !== 'RENT') {
            const { data, error } = await supabaseAdmin
                .from('payments')
                .insert([{ ...body, status: body.status ?? 'PAID' }])
                .select();

            if (error) throw error;
            return NextResponse.json(data[0], { status: 201 });
        }

        // ── RENT payment: split into month slots ────────────────────────────
        const tenantId: number = body.tenant_id;
        const amountPaid: number = parseFloat(body.amount);
        const datePaid: string = body.date_paid;   // "YYYY-MM-DD"

        // 1. Fetch tenant details (rent_amount, rent_due_day, lease_start)
        const { data: tenant, error: tenantErr } = await supabaseAdmin
            .from('tenants')
            .select('rent_amount, rent_due_day, lease_start')
            .eq('id', tenantId)
            .single();

        if (tenantErr || !tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 400 });
        }

        // 2. Fetch all existing RENT payments for this tenant to find covered months
        const { data: existingPayments, error: existErr } = await supabaseAdmin
            .from('payments')
            .select('utilization_data')
            .eq('tenant_id', tenantId)
            .eq('payment_type', 'RENT');

        if (existErr) throw existErr;

        const coveredMonths = extractCoveredMonths(
            (existingPayments ?? []) as Array<{ utilization_data?: MonthSlot[] }>
        );

        // 3. Split the payment
        const slots = splitRentPayment(
            amountPaid,
            datePaid,
            Number(tenant.rent_amount),
            tenant.rent_due_day ?? 1,
            tenant.lease_start,
            coveredMonths
        );

        // 4. Compute top-level status
        const topStatus = computePaymentStatus(slots);

        // 5. Build payment record
        // date_due = earliest slot's due date (oldest arrear or current month)
        const firstSlot = slots[0];
        const dateDue = firstSlot?.date_due ?? body.date_due;

        const paymentRecord = {
            tenant_id: tenantId,
            amount: amountPaid,
            payment_type: 'RENT',
            payment_method: body.payment_method ?? 'CASH',
            status: topStatus,
            date_due: dateDue,
            date_paid: datePaid,
            notes: body.notes ?? null,
            utilization_data: slots,
        };

        const { data, error } = await supabaseAdmin
            .from('payments')
            .insert([paymentRecord])
            .select();

        if (error) throw error;
        return NextResponse.json(data[0], { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
