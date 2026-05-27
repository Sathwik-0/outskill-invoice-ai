import { callGroqJSON } from '@/lib/ai/groq';
import { AIExtractedData } from '@/types';

const SYSTEM_PROMPT = `You are an expert OCR and invoice parsing AI specialized in Indian business invoices.
Extract structured data from invoice text/descriptions.
Always return valid JSON with these exact fields.
For Indian invoices, amounts may include GST. Extract the total payable amount.
Categories: Inventory, Services, Utilities, Transport, Raw Materials, Other`;

export async function extractInvoiceData(
  imageDescription: string
): Promise<AIExtractedData> {
  const result = await callGroqJSON<AIExtractedData>(
    SYSTEM_PROMPT,
    `Extract invoice data from this content:\n\n${imageDescription}\n\nReturn JSON with: customer_name, amount (number), due_date (YYYY-MM-DD or null), invoice_number (string or null), category (string), items (array of {name, quantity, rate, amount}), confidence (0-1)`,
    { maxTokens: 800 }
  );

  return {
    customer_name: result.customer_name ?? 'Unknown Customer',
    amount: typeof result.amount === 'number' ? result.amount : 0,
    due_date: result.due_date ?? undefined,
    invoice_number: result.invoice_number ?? undefined,
    category: result.category ?? 'Other',
    items: Array.isArray(result.items) ? result.items : [],
    confidence: typeof result.confidence === 'number' ? result.confidence : 0.8,
  };
}

export async function extractFromText(text: string): Promise<AIExtractedData> {
  return extractInvoiceData(text);
}
