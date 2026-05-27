import { Invoice } from '@/types';

export interface LedgerEntryInput {
  invoice_id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: string;
  entry_date: string;
  metadata: Record<string, unknown>;
}

export function buildLedgerEntry(invoice: Invoice): LedgerEntryInput {
  return {
    invoice_id: invoice.id,
    user_id: invoice.user_id,
    type: 'debit', // pending collection = debit (money owed to us)
    amount: invoice.amount,
    description: `Invoice from ${invoice.customer_name}`,
    category: invoice.category ?? 'Other',
    entry_date: new Date().toISOString().split('T')[0],
    metadata: {
      invoice_number: invoice.invoice_number,
      customer_name: invoice.customer_name,
      due_date: invoice.due_date,
    },
  };
}

export function buildPaymentEntry(invoice: Invoice): LedgerEntryInput {
  return {
    invoice_id: invoice.id,
    user_id: invoice.user_id,
    type: 'credit',
    amount: invoice.amount,
    description: `Payment received from ${invoice.customer_name}`,
    category: invoice.category ?? 'Other',
    entry_date: new Date().toISOString().split('T')[0],
    metadata: {
      invoice_number: invoice.invoice_number,
      customer_name: invoice.customer_name,
      paid_at: new Date().toISOString(),
    },
  };
}
