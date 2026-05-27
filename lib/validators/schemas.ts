import { z } from 'zod';

export const InvoiceCreateSchema = z.object({
  customer_name: z.string().min(1, 'Customer name required').max(200),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('INR'),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).default('pending'),
  due_date: z.string().nullable().optional(),
  invoice_number: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    rate: z.number(),
    amount: z.number(),
  })).default([]),
  image_url: z.string().nullable().optional(),
  ai_extracted: z.record(z.unknown()).default({}),
  notes: z.string().nullable().optional(),
});

export const InvoiceUpdateSchema = InvoiceCreateSchema.partial();

export const ReminderCreateSchema = z.object({
  invoice_id: z.string().uuid(),
  message: z.string().min(1).max(500),
  channel: z.enum(['whatsapp', 'sms', 'email']).default('whatsapp'),
  scheduled_at: z.string().nullable().optional(),
});

export const UploadSchema = z.object({
  file: z.instanceof(File),
  description: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SignupSchema = LoginSchema.extend({
  businessName: z.string().min(1, 'Business name required').max(200),
});

export type InvoiceCreateInput = z.infer<typeof InvoiceCreateSchema>;
export type InvoiceUpdateInput = z.infer<typeof InvoiceUpdateSchema>;
export type ReminderCreateInput = z.infer<typeof ReminderCreateSchema>;
