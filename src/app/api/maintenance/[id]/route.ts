import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
        .from('maintenance_requests')
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

    const { data, error } = await supabaseAdmin
        .from('maintenance_requests')
        .update(body)
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
        .from('maintenance_requests')
        .delete()
        .eq('id', numericId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: 'Request deleted successfully' });
}
