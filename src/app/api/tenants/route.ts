import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('tenants')
            .select(`
                *,
                properties (
                    id,
                    house_number
                )
            `)
            .order('name', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { data, error } = await supabaseAdmin
            .from('tenants')
            .insert([body])
            .select();

        if (error) throw error;

        const newTenant = data[0];

        // Create initial payment records (Deposit and First Rent)
        const initialPayments = [];
        
        if (body.deposit > 0) {
            initialPayments.push({
                tenant_id: newTenant.id,
                amount: body.deposit,
                payment_type: 'DEPOSIT',
                status: 'PAID',
                date_due: body.lease_start,
                date_paid: body.lease_start,
                notes: 'Initial security deposit'
            });
        }

        if (body.initial_rent_paid && body.rent_amount > 0) {
            initialPayments.push({
                tenant_id: newTenant.id,
                amount: body.rent_amount,
                payment_type: 'RENT',
                status: 'PAID',
                date_due: body.lease_start,
                date_paid: body.lease_start,
                notes: 'First month rent'
            });
        }

        if (initialPayments.length > 0) {
            const { error: payError } = await supabaseAdmin
                .from('payments')
                .insert(initialPayments);
            
            if (payError) console.error('Error creating initial payments:', payError);
        }

        // Update property occupancy status
        if (body.property_id) {
            const { error: propError } = await supabaseAdmin
                .from('properties')
                .update({ is_occupied: true })
                .eq('id', body.property_id);
            
            if (propError) console.error('Error updating property occupancy:', propError);
        }

        return NextResponse.json(newTenant, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
