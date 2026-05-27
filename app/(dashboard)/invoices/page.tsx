import { createClient } from '@/lib/supabase/server';
import InvoiceList from '@/components/invoice/InvoiceList';

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl text-sage-900">Invoices</h1>
        <p className="text-gray-500 mt-1 text-sm">{(invoices ?? []).length} total invoices</p>
      </div>
      <InvoiceList invoices={invoices ?? []} />
    </div>
  );
}
