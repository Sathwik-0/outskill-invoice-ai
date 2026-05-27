import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { InvoiceStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateStr);
}

export function getDaysOverdue(dueDateStr: string | null): number {
  if (!dueDateStr) return 0;
  const diff = Date.now() - new Date(dueDateStr).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

export function getStatusColor(status: InvoiceStatus): string {
  const map: Record<InvoiceStatus, string> = {
    pending: 'text-amber-600 bg-amber-50 border-amber-200',
    paid: 'text-sage-600 bg-sage-50 border-sage-200',
    overdue: 'text-red-600 bg-red-50 border-red-200',
    cancelled: 'text-gray-500 bg-gray-50 border-gray-200',
  };
  return map[status];
}

export function getStatusLabel(status: InvoiceStatus): string {
  const map: Record<InvoiceStatus, string> = {
    pending: 'Pending',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  };
  return map[status];
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
