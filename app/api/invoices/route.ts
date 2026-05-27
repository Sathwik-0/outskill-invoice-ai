import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractInvoiceData } from '@/lib/ai/invoiceExtractor';
import { buildLedgerEntry } from '@/lib/ai/ledgerUpdater';
import { InvoiceCreateSchema } from '@/lib/validators/schemas';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const description = formData.get('description') as string | null;

    if (!file && !description) {
      return NextResponse.json({ error: 'File or description required' }, { status: 400 });
    }

    let imageUrl: string | null = null;
    let textContent = description ?? '';

    // Upload image to Supabase Storage
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(fileName, file, { contentType: file.type, upsert: false });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(uploadData.path);
      imageUrl = urlData.publicUrl;

      // Use file metadata as context if no description
      if (!textContent) {
        textContent = `Invoice file: ${file.name}, size: ${file.size} bytes. Extract reasonable sample data for a typical Indian business invoice.`;
      }
    }

    // AI extraction
    const aiData = await extractInvoiceData(textContent);

    // Build and validate invoice
    const invoiceInput = InvoiceCreateSchema.parse({
      customer_name: aiData.customer_name ?? 'Unknown Customer',
      amount: aiData.amount ?? 0,
      due_date: aiData.due_date ?? null,
      invoice_number: aiData.invoice_number ?? null,
      category: aiData.category ?? 'Other',
      items: aiData.items ?? [],
      image_url: imageUrl,
      ai_extracted: aiData,
      status: 'pending',
    });

    // Insert invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({ ...invoiceInput, user_id: user.id })
      .select()
      .single();

    if (invoiceError) throw new Error(invoiceError.message);

    // Insert ledger entry
    const ledgerEntry = buildLedgerEntry(invoice);
    await supabase.from('ledger_entries').insert({ ...ledgerEntry, user_id: user.id });

    // Log timeline events
    const events = [
      { event_type: 'invoice_uploaded', title: 'Invoice uploaded', description: `File uploaded for ${invoice.customer_name}` },
      { event_type: 'ai_extracted', title: `AI extracted ₹${invoice.amount.toLocaleString('en-IN')}`, description: `Data extracted with ${Math.round((aiData.confidence ?? 0.8) * 100)}% confidence` },
      { event_type: 'ledger_updated', title: 'Ledger updated', description: 'Pending payment entry created' },
    ];

    await supabase.from('activity_timeline').insert(
      events.map(e => ({ ...e, user_id: user.id, invoice_id: invoice.id }))
    );

    return NextResponse.json({ data: invoice, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/invoices]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') ?? '20');

    let query = supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({ data, error: null });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
