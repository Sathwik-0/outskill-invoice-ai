import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils/helpers';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default async function LedgerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from('ledger_entries')
    .select('*')
    .eq('user_id', user!.id)
    .order('entry_date', { ascending: false })
    .limit(50);

  const all = entries ?? [];
  const totalCredit = all.filter(e => e.type === 'credit').reduce((s, e) => s + e.amount, 0);
  const totalDebit = all.filter(e => e.type === 'debit').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl text-sage-900">Ledger</h1>
        <p className="text-gray-500 mt-1 text-sm">Automatic bookkeeping entries</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-sage-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-sage-500" />
            <span className="text-xs text-gray-500">Money collected</span>
          </div>
          <div className="font-display text-2xl text-sage-700">{formatCurrency(totalCredit)}</div>
        </div>
        <div className="bg-white border border-sage-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={14} className="text-amber-500" />
            <span className="text-xs text-gray-500">Pending collection</span>
          </div>
          <div className="font-display text-2xl text-amber-600">{formatCurrency(totalDebit)}</div>
        </div>
      </div>

      {/* Entries */}
      <div className="bg-white border border-sage-100 rounded-2xl overflow-hidden">
        {all.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            No ledger entries yet. Upload an invoice to get started.
          </div>
        ) : (
          <div className="divide-y divide-sage-50">
            {all.map(entry => (
              <div key={entry.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="text-sm font-medium text-gray-800">{entry.description}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {entry.category} · {formatDate(entry.entry_date)}
                  </div>
                </div>
                <div className={`font-display text-base font-medium ${entry.type === 'credit' ? 'text-sage-600' : 'text-amber-600'}`}>
                  {entry.type === 'credit' ? '+' : ''}{formatCurrency(entry.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
