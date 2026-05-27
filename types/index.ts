export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type ReminderChannel = 'whatsapp' | 'sms' | 'email';
export type ReminderStatus = 'pending' | 'sent' | 'failed';
export type LedgerType = 'credit' | 'debit';

export interface Invoice {
  id: string;
  user_id: string;
  customer_name: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  due_date: string | null;
  invoice_number: string | null;
  category: string | null;
  items: InvoiceItem[];
  image_url: string | null;
  ai_extracted: AIExtractedData;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface AIExtractedData {
  customer_name?: string;
  amount?: number;
  due_date?: string;
  invoice_number?: string;
  category?: string;
  items?: InvoiceItem[];
  confidence?: number;
  raw_text?: string;
}

export interface LedgerEntry {
  id: string;
  user_id: string;
  invoice_id: string | null;
  type: LedgerType;
  amount: number;
  description: string | null;
  category: string | null;
  entry_date: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  invoice_id: string;
  message: string;
  channel: ReminderChannel;
  status: ReminderStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  invoice?: Invoice;
}

export interface ActivityEvent {
  id: string;
  user_id: string;
  invoice_id: string | null;
  event_type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  invoice?: Pick<Invoice, 'id' | 'customer_name' | 'amount' | 'status'>;
}

export interface DashboardStats {
  totalPending: number;
  totalPaid: number;
  overdueCount: number;
  dueToday: number;
  pendingAmount: number;
  paidThisMonth: number;
  weeklyChange: number;
}

export interface AIWorkflowStage {
  id: string;
  label: string;
  status: 'waiting' | 'processing' | 'done' | 'error';
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
