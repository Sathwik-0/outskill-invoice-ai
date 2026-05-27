import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildPaymentEntry } from '@/lib/ai/ledgerUpdater';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // If marking as paid, add credit ledger entry
    if (body.status === 'paid') {
      const paymentEntry = buildPaymentEntry(invoice);
      await supabase.from('ledger_entries').insert({ ...paymentEntry, user_id: user.id });

      await supabase.from('activity_timeline').insert({
        user_id: user.id,
        invoice_id: id,
        event_type: 'payment_received',
        title: `Payment received ₹${invoice.amount.toLocaleString('en-IN')}`,
        description: `${invoice.customer_name} marked as paid`,
      });
    }

    return NextResponse.json({ data: invoice, error: null });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);
    return NextResponse.json({ data: true, error: null });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
