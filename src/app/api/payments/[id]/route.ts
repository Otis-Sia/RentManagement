import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
    splitRentPayment,
    computePaymentStatus,
    extractCoveredMonths,
    type MonthSlot,
} from '@/lib/rentSplit';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from('payments')
        .select(`
            *,
            tenants (
                id,
                name,
                properties (
                    id,
                    house_number,
                    address
                )
            )
        `)
        .eq('id', numericId)
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const numericId = parseInt(id);
    const body = await request.json();

    if (isNaN(numericId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // ── Non-RENT edits: simple update ──────────────────────────────────────
    if (body.payment_type !== 'RENT') {
        const { data, error } = await supabaseAdmin
            .from('payments')
            .update(body)
            .eq('id', numericId)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    }

    // ── RENT edits: re-split ────────────────────────────────────────────────
    let tenantId: number = body.tenant_id;
    if (!tenantId) {
        const { data: existing } = await supabaseAdmin
            .from('payments')
            .select('tenant_id')
            .eq('id', numericId)
            .single();
        tenantId = existing?.tenant_id;
    }

    const amountPaid: number = parseFloat(body.amount);
    const datePaid: string = body.date_paid;

    // Fetch tenant
    const { data: tenant, error: tenantErr } = await supabaseAdmin
        .from('tenants')
        .select('rent_amount, rent_due_day, lease_start')
        .eq('id', tenantId)
        .single();

    if (tenantErr || !tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 400 });
    }

    // Fetch all OTHER RENT payments for this tenant (exclude the one being edited)
    const { data: existingPayments, error: existErr } = await supabaseAdmin
        .from('payments')
        .select('utilization_data')
        .eq('tenant_id', tenantId)
        .eq('payment_type', 'RENT')
        .neq('id', numericId);

    if (existErr) throw existErr;

    const coveredMonths = extractCoveredMonths(
        (existingPayments ?? []) as Array<{ utilization_data?: MonthSlot[] }>
    );

    const slots = splitRentPayment(
        amountPaid,
        datePaid,
        Number(tenant.rent_amount),
        tenant.rent_due_day ?? 1,
        tenant.lease_start,
        coveredMonths
    );

    const topStatus = computePaymentStatus(slots);
    const dateDue = slots[0]?.date_due ?? body.date_due;

    const updatePayload = {
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
        .update(updatePayload)
        .eq('id', numericId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from('payments')
        .delete()
        .eq('id', numericId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: 'Payment record deleted successfully' });
}
