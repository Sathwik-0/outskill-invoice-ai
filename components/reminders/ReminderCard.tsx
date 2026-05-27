'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, MessageSquare, Pencil, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatRelativeDate } from '@/lib/utils/helpers';

type ReminderCardProps = {
  reminder: {
    id: string;
    message: string;
    channel: string;
    status: string;
    created_at: string;
    invoice?: {
      customer_name?: string;
      amount?: number;
      status?: string;
    } | null;
  };
  businessName: string;
};

export default function ReminderCard({ reminder, businessName }: ReminderCardProps) {
  const [message, setMessage] = useState(reminder.message);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const invoice = reminder.invoice;

  async function copyMessage() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Reminder copied for WhatsApp');
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-sage-100 bg-white shadow-sm shadow-sage-100/70"
    >
      <div className="flex items-start justify-between gap-4 border-b border-sage-50 p-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <MessageSquare size={17} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">
              {invoice?.customer_name ?? 'Customer'}
            </div>
            <div className="mt-0.5 text-xs text-gray-400">
              {formatCurrency(invoice?.amount ?? 0)} · {formatRelativeDate(reminder.created_at)}
            </div>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
          reminder.status === 'sent' ? 'bg-sage-100 text-sage-700' :
          reminder.status === 'failed' ? 'bg-red-100 text-red-700' :
          'bg-amber-100 text-amber-700'
        }`}>
          {reminder.status}
        </span>
      </div>

      <div className="bg-[#e7f5df] p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-800/70">
          WhatsApp preview
        </div>
        <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed text-gray-800 shadow-sm">
          {editing ? (
            <textarea
              value={message}
              onChange={event => setMessage(event.target.value)}
              className="h-28 w-full resize-none border-none bg-transparent p-0 text-sm leading-relaxed outline-none"
            />
          ) : (
            <p className="whitespace-pre-wrap">{message}</p>
          )}
          <div className="mt-2 text-right text-[10px] text-gray-400">{businessName}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-4">
        <button
          onClick={() => setEditing(value => !value)}
          className="inline-flex items-center gap-2 rounded-lg border border-sage-100 px-3 py-2 text-xs font-semibold text-sage-700 transition hover:bg-sage-50"
        >
          {editing ? <Check size={14} /> : <Pencil size={14} />}
          {editing ? 'Done editing' : 'Edit message'}
        </button>
        <button
          onClick={copyMessage}
          className="inline-flex items-center gap-2 rounded-lg border border-sage-100 px-3 py-2 text-xs font-semibold text-sage-700 transition hover:bg-sage-50"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
        >
          <Send size={14} />
          Open WhatsApp
        </a>
      </div>
    </motion.div>
  );
}
