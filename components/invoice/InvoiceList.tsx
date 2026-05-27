'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CheckCircle, Copy, Inbox, MessageSquare, Send, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import AIOrchestration, { OrchestrationStage } from '@/components/ai/AIOrchestration';
import { Invoice } from '@/types';
import { cn, formatCurrency, formatDate, getStatusColor, getStatusLabel, truncate } from '@/lib/utils/helpers';

const REMINDER_STAGES: OrchestrationStage[] = [
  { id: 'generate', label: 'Generating reminder...', detail: 'Reading invoice context and payment status.', status: 'waiting' },
  { id: 'tone', label: 'Optimizing tone...', detail: 'Keeping it respectful, clear, and WhatsApp-friendly.', status: 'waiting' },
  { id: 'final', label: 'Finalizing payment follow-up...', detail: 'Preparing editable message preview.', status: 'waiting' },
];

export default function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<string>('all');
  const [reminderStages, setReminderStages] = useState<OrchestrationStage[]>(REMINDER_STAGES);
  const [reminderPreview, setReminderPreview] = useState<{ invoice: Invoice; message: string } | null>(null);
  const [showReminderFlow, setShowReminderFlow] = useState(false);

  const filtered = filter === 'all' ? invoices : invoices.filter(invoice => invoice.status === filter);

  async function markPaid(id: string) {
    setLoading(value => ({ ...value, [id]: 'paying' }));
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      });
      const { error } = await res.json();
      if (error) throw new Error(error);
      toast.success('Marked as paid');
      router.refresh();
    } catch (err) {
      toast.error('Could not update invoice', { description: err instanceof Error ? err.message : 'Please retry.' });
    } finally {
      setLoading(value => { const next = { ...value }; delete next[id]; return next; });
    }
  }

  async function sendReminder(invoice: Invoice) {
    setShowReminderFlow(true);
    setReminderPreview(null);
    setReminderStages(REMINDER_STAGES.map(stage => ({ ...stage, status: 'waiting' })));
    setLoading(value => ({ ...value, [invoice.id]: 'reminder' }));

    try {
      updateReminderStage('generate', 'processing');
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoice.id }),
      });
      await delay(420);
      updateReminderStage('generate', 'done');
      updateReminderStage('tone', 'processing');
      await delay(520);
      updateReminderStage('tone', 'done');
      updateReminderStage('final', 'processing');

      const { data, error } = await res.json();
      if (error) throw new Error(error);
      await delay(380);
      updateReminderStage('final', 'done');
      setReminderPreview({ invoice, message: data?.message ?? buildFallbackReminder(invoice) });
      toast.success('Reminder ready to review');
      router.refresh();
    } catch (err) {
      setReminderStages(prev => prev.map(stage => stage.status === 'processing' ? { ...stage, status: 'error' } : stage));
      setReminderPreview({ invoice, message: buildFallbackReminder(invoice) });
      toast.warning('Using a safe fallback reminder', {
        description: err instanceof Error ? err.message : 'AI service was unavailable.',
      });
    } finally {
      setLoading(value => { const next = { ...value }; delete next[invoice.id]; return next; });
    }
  }

  async function deleteInvoice(id: string) {
    if (!confirm('Delete this invoice?')) return;
    setLoading(value => ({ ...value, [id]: 'deleting' }));
    try {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      toast.success('Invoice deleted');
      router.refresh();
    } catch {
      toast.error('Failed to delete invoice');
    } finally {
      setLoading(value => { const next = { ...value }; delete next[id]; return next; });
    }
  }

  function updateReminderStage(id: string, status: OrchestrationStage['status']) {
    setReminderStages(prev => prev.map(stage => stage.id === id ? { ...stage, status } : stage));
  }

  const filters = ['all', 'pending', 'paid', 'overdue'];

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map(item => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={cn(
              'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all',
              filter === item
                ? 'bg-sage-500 text-white shadow-sm shadow-sage-200'
                : 'border border-gray-200 bg-white text-gray-500 hover:border-sage-300'
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sage-200 bg-white p-8 text-center shadow-sm shadow-sage-100/60 sm:py-16">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-50 text-sage-500">
            <Inbox size={30} />
          </div>
          <p className="text-sm font-semibold text-sage-900">
            {filter === 'all' ? 'Upload your first invoice' : `No ${filter} invoices`}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
            Upload an invoice and let AI automatically extract customer details, update your ledger, and prepare a WhatsApp reminder.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(invoice => {
            const isLoading = !!loading[invoice.id];
            return (
              <div key={invoice.id} className="rounded-xl border border-sage-100 bg-white p-4 shadow-sm shadow-sage-100/50 transition-all hover:border-sage-200 hover:shadow-md">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">{truncate(invoice.customer_name, 30)}</span>
                      <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', getStatusColor(invoice.status))}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
                      <span>{invoice.category ?? 'Uncategorized'}</span>
                      {invoice.due_date && <span>Due {formatDate(invoice.due_date)}</span>}
                      {invoice.invoice_number && <span>#{invoice.invoice_number}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <div className="font-display text-lg text-sage-900">{formatCurrency(invoice.amount)}</div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {invoice.status === 'pending' && (
                        <>
                          <button
                            onClick={() => markPaid(invoice.id)}
                            disabled={isLoading}
                            title="Mark as paid"
                            className="rounded-lg p-2 text-sage-500 transition-colors hover:bg-sage-50 disabled:opacity-40"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => sendReminder(invoice)}
                            disabled={isLoading}
                            title="Generate reminder"
                            className="rounded-lg p-2 text-amber-500 transition-colors hover:bg-amber-50 disabled:opacity-40"
                          >
                            <MessageSquare size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteInvoice(invoice.id)}
                        disabled={isLoading}
                        title="Delete"
                        className="rounded-lg p-2 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ReminderPreviewModal
        open={showReminderFlow}
        stages={reminderStages}
        preview={reminderPreview}
        onClose={() => setShowReminderFlow(false)}
        onChangeMessage={message => setReminderPreview(prev => prev ? { ...prev, message } : prev)}
      />
    </div>
  );
}

function ReminderPreviewModal({
  open,
  stages,
  preview,
  onClose,
  onChangeMessage,
}: {
  open: boolean;
  stages: OrchestrationStage[];
  preview: { invoice: Invoice; message: string } | null;
  onClose: () => void;
  onChangeMessage: (message: string) => void;
}) {
  async function copyMessage() {
    if (!preview) return;
    await navigator.clipboard.writeText(preview.message);
    toast.success('Reminder copied for WhatsApp');
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end bg-sage-950/30 p-3 backdrop-blur-sm sm:items-center sm:justify-center"
        >
          <motion.div
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            className="max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-cream-50 p-4 shadow-2xl sm:max-w-lg"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-sage-900">Reminder generation</h3>
                <p className="text-xs text-gray-500">Review the AI message before sending.</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-gray-700">
                <X size={16} />
              </button>
            </div>

            {!preview ? (
              <AIOrchestration
                stages={stages}
                title="AI reminder assistant running"
                subtitle="The assistant is preparing a clear, respectful payment follow-up."
                completeLabel="Reminder ready"
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-sage-100 bg-white">
                <div className="border-b border-sage-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">{preview.invoice.customer_name}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{formatCurrency(preview.invoice.amount)} pending collection</p>
                </div>
                <div className="bg-[#e7f5df] p-4">
                  <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                    <textarea
                      value={preview.message}
                      onChange={event => onChangeMessage(event.target.value)}
                      className="h-28 w-full resize-none border-none bg-transparent p-0 text-sm leading-relaxed text-gray-800 outline-none"
                    />
                    <div className="mt-2 text-right text-[10px] text-gray-400">editable preview</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 p-4">
                  <button onClick={copyMessage} className="inline-flex items-center gap-2 rounded-lg border border-sage-100 px-3 py-2 text-xs font-semibold text-sage-700 hover:bg-sage-50">
                    <Copy size={14} />
                    Copy
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(preview.message)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <Send size={14} />
                    Open WhatsApp
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function buildFallbackReminder(invoice: Invoice) {
  return `Hi ${invoice.customer_name}, gentle reminder for pending invoice payment of ${formatCurrency(invoice.amount)}. Please clear it when convenient. Thank you.`;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
