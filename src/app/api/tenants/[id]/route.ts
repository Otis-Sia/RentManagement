import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        // Fetch tenant basic info
        const { data: tenant, error: tenantError } = await supabaseAdmin
            .from('tenants')
            .select(`
                *,
                properties (
                    id,
                    house_number,
                    address
                )
            `)
            .eq('id', id)
            .single();

        if (tenantError) throw tenantError;

        // Fetch payments
        const { data: payments } = await supabaseAdmin
            .from('payments')
            .select('*')
            .eq('tenant_id', id)
            .order('date_due', { ascending: false });

        // Fetch maintenance requests
        const { data: maintenance } = await supabaseAdmin
            .from('maintenance_requests')
            .select('*')
            .eq('tenant_id', id)
            .order('request_date', { ascending: false });

        return NextResponse.json({
            ...tenant,
            property: tenant.properties?.id,
            house_number: tenant.properties?.house_number,
            house_address: tenant.properties?.address,
            payments,
            maintenance_requests: maintenance
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { data, error } = await supabaseAdmin
            .from('tenants')
            .update(body)
            .eq('id', id)
            .select();

        if (error) throw error;
        return NextResponse.json(data[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const numericId = parseInt(id);

        if (isNaN(numericId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('tenants')
            .delete()
            .eq('id', numericId);

        if (error) throw error;
        return NextResponse.json({ message: 'Tenant deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
