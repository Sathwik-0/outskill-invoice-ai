'use client';
import { useState } from 'react';
import { Invoice } from '@/types';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, truncate } from '@/lib/utils/helpers';
import { CheckCircle, MessageSquare, Trash2, Inbox, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/helpers';

export default function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);

  async function markPaid(id: string) {
    setLoading(l => ({ ...l, [id]: 'paying' }));
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      });
      const { error } = await res.json();
      if (error) throw new Error(error);
      toast.success('Marked as paid!');
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(l => { const n = { ...l }; delete n[id]; return n; });
    }
  }

  async function sendReminder(invoiceId: string) {
    setLoading(l => ({ ...l, [invoiceId]: 'reminder' }));
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId }),
      });
      const { data, error } = await res.json();
      if (error) throw new Error(error);
      toast.success('Reminder generated!', { description: data?.message?.slice(0, 80) + '…' });
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(l => { const n = { ...l }; delete n[invoiceId]; return n; });
    }
  }

  async function deleteInvoice(id: string) {
    if (!confirm('Delete this invoice?')) return;
    setLoading(l => ({ ...l, [id]: 'deleting' }));
    try {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      toast.success('Invoice deleted');
      router.refresh();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setLoading(l => { const n = { ...l }; delete n[id]; return n; });
    }
  }

  const filters = ['all', 'pending', 'paid', 'overdue'];

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
              filter === f
                ? 'bg-sage-500 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-sage-300'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-sage-100 rounded-2xl text-center py-16">
          <Inbox size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No invoices yet</p>
          <p className="text-xs text-gray-300 mt-1">Upload an invoice from the dashboard</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(invoice => {
            const isLoading = !!loading[invoice.id];
            return (
              <div key={invoice.id} className="bg-white border border-sage-100 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-sage-200 transition-colors">
                {/* Left */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">{truncate(invoice.customer_name, 30)}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', getStatusColor(invoice.status))}>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 space-x-3">
                    <span>{invoice.category ?? 'Uncategorized'}</span>
                    {invoice.due_date && <span>Due {formatDate(invoice.due_date)}</span>}
                    {invoice.invoice_number && <span>#{invoice.invoice_number}</span>}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <div className="font-display text-lg text-sage-900">{formatCurrency(invoice.amount)}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {invoice.status === 'pending' && (
                    <>
                      <button
                        onClick={() => markPaid(invoice.id)}
                        disabled={isLoading}
                        title="Mark as paid"
                        className="p-2 text-sage-500 hover:bg-sage-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => sendReminder(invoice.id)}
                        disabled={isLoading}
                        title="Generate reminder"
                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteInvoice(invoice.id)}
                    disabled={isLoading}
                    title="Delete"
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
