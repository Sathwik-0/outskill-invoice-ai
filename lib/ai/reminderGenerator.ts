import { callGroqJSON } from '@/lib/ai/groq';
import { Invoice } from '@/types';

const SYSTEM_PROMPT = `You are a polite, professional payment reminder generator for Indian micro-businesses.
Generate WhatsApp-friendly reminders in a respectful tone.
Use simple language. Include the amount in INR (₹). Keep it under 160 characters.
Be warm but clear about the payment request.`;

interface ReminderOutput {
  message: string;
  subject: string;
}

export async function generateReminder(invoice: Invoice): Promise<ReminderOutput> {
  const daysOverdue = invoice.due_date
    ? Math.floor((Date.now() - new Date(invoice.due_date).getTime()) / 86400000)
    : 0;

  const context = `
Customer: ${invoice.customer_name}
Amount: ₹${invoice.amount.toLocaleString('en-IN')}
Due Date: ${invoice.due_date ?? 'Not specified'}
Days Overdue: ${daysOverdue > 0 ? daysOverdue : 0}
Invoice #: ${invoice.invoice_number ?? 'N/A'}
  `.trim();

  return callGroqJSON<ReminderOutput>(
    SYSTEM_PROMPT,
    `Generate a payment reminder for:\n${context}\n\nReturn JSON with: message (the WhatsApp message), subject (short subject line)`,
    { maxTokens: 300 }
  );
}
