import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateReminder } from '@/lib/ai/reminderGenerator';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { invoice_id } = await req.json();
    if (!invoice_id) return NextResponse.json({ error: 'invoice_id required' }, { status: 400 });

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    const { message } = await generateReminder(invoice);

    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({ user_id: user.id, invoice_id, message, channel: 'whatsapp', status: 'pending' })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Log timeline
    await supabase.from('activity_timeline').insert({
      user_id: user.id,
      invoice_id,
      event_type: 'reminder_generated',
      title: 'Reminder generated',
      description: `WhatsApp reminder for ${invoice.customer_name}`,
      metadata: { message },
    });

    return NextResponse.json({ data: { reminder, message }, error: null });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('reminders')
      .select('*, invoice:invoices(id, customer_name, amount, status)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw new Error(error.message);
    return NextResponse.json({ data, error: null });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
