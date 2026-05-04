import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        // Fetch house basic info
        const { data: house, error: houseError } = await supabaseAdmin
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

        if (houseError) throw houseError;

        // Fetch current tenant
        const { data: activeTenants } = await supabaseAdmin
            .from('tenants')
            .select('*')
            .eq('property_id', id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1);
        
        const currentTenant = activeTenants && activeTenants.length > 0 ? activeTenants[0] : null;

        // Fetch payment history
        const { data: payments } = await supabaseAdmin
            .from('payments')
            .select(`
                *,
                tenants!inner (
                    id,
                    name,
                    property_id
                )
            `)
            .eq('tenants.property_id', id)
            .order('date_due', { ascending: false })
            .limit(10);

        // Fetch maintenance requests
        const { data: maintenance } = await supabaseAdmin
            .from('maintenance_requests')
            .select(`
                *,
                tenants!inner (
                    id,
                    name,
                    property_id
                )
            `)
            .eq('tenants.property_id', id)
            .order('request_date', { ascending: false })
            .limit(10);

        // Fetch tenant history
        const { data: history } = await supabaseAdmin
            .from('tenants')
            .select('*')
            .eq('property_id', id)
            .order('lease_start', { ascending: false });

        return NextResponse.json({
            ...house,
            current_tenant: currentTenant,
            payment_history: payments?.map((p: any) => ({
                ...p,
                tenant_name: p.tenants?.name,
                tenant_id: p.tenants?.id
            })),
            maintenance_requests: maintenance?.map((m: any) => ({
                ...m,
                tenant_name: m.tenants?.name,
                tenant_id: m.tenants?.id
            })),
            tenant_history: history
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
            .from('properties')
            .update(body)
            .eq('id', id)
            .select();

        if (error) throw error;
        return NextResponse.json(data[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
