import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Fetch house basic info
        const { data: house, error: houseError } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

        if (houseError) throw houseError;

        // Fetch current tenant
        const { data: currentTenant } = await supabase
            .from('tenants')
            .select('*')
            .eq('property_id', id)
            .eq('is_active', true)
            .single();

        // Fetch payment history
        const { data: payments } = await supabase
            .from('payments')
            .select(`
                *,
                tenants (
                    id,
                    name
                )
            `)
            .eq('tenants.property_id', id)
            .order('date_due', { ascending: false })
            .limit(10);

        // Fetch maintenance requests
        const { data: maintenance } = await supabase
            .from('maintenance_requests')
            .select(`
                *,
                tenants (
                    id,
                    name
                )
            `)
            .eq('tenants.property_id', id)
            .order('request_date', { ascending: false })
            .limit(10);

        // Fetch tenant history
        const { data: history } = await supabase
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
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { data, error } = await supabase
            .from('properties')
            .update(body)
            .eq('id', params.id)
            .select();

        if (error) throw error;
        return NextResponse.json(data[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
