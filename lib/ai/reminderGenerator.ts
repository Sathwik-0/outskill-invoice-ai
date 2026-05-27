import { callGroqJSON } from '@/lib/ai/groq';
import { Invoice } from '@/types';

const SYSTEM_PROMPT = `You are a polite, professional payment reminder generator for Indian micro-businesses.
Generate WhatsApp-friendly reminders in a respectful tone.
Use simple English. Include the amount in INR. Keep it under 180 characters.
Be warm but clear about the payment request. Never sound aggressive.`;

interface ReminderOutput {
  message: string;
  subject: string;
}

type BusinessProfile = {
  business_name?: string;
  owner_name?: string;
  whatsapp_number?: string;
  store_type?: string;
};

export async function generateReminder(invoice: Invoice, profile: BusinessProfile = {}): Promise<ReminderOutput> {
  const daysOverdue = invoice.due_date
    ? Math.floor((Date.now() - new Date(invoice.due_date).getTime()) / 86400000)
    : 0;

  const businessName = profile.business_name || 'the business';
  const context = `
Business: ${businessName}
Owner: ${profile.owner_name || 'Not specified'}
Store type: ${profile.store_type || 'Indian micro-business'}
Customer: ${invoice.customer_name}
Amount: INR ${invoice.amount.toLocaleString('en-IN')}
Due Date: ${invoice.due_date ?? 'Not specified'}
Days Overdue: ${daysOverdue > 0 ? daysOverdue : 0}
Invoice #: ${invoice.invoice_number ?? 'N/A'}
  `.trim();

  try {
    return await callGroqJSON<ReminderOutput>(
      SYSTEM_PROMPT,
      `Generate a payment reminder for:\n${context}\n\nReturn JSON with: message (the WhatsApp message), subject (short subject line)`,
      { maxTokens: 300 }
    );
  } catch {
    return {
      subject: 'Payment reminder',
      message: `Hi ${invoice.customer_name}, this is ${businessName}. Gentle reminder for pending payment of INR ${invoice.amount.toLocaleString('en-IN')}. Please clear it when convenient. Thank you.`,
    };
  }
}
