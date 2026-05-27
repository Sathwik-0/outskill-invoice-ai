import { Bell, MessageSquare, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ReminderCard from '@/components/reminders/ReminderCard';

export default async function RemindersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: reminders } = await supabase
    .from('reminders')
    .select('*, invoice:invoices(id, customer_name, amount, status)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(30);

  const all = reminders ?? [];
  const businessName = (user?.user_metadata?.business_name as string) || 'Your Business';

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-sage-900">Reminders</h1>
          <p className="mt-1 text-sm text-gray-500">
            {all.length} WhatsApp-ready follow-up{all.length !== 1 ? 's' : ''} generated
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sage-100 bg-white px-3 py-2 text-xs font-semibold text-sage-700 shadow-sm">
          <Sparkles size={14} />
          AI tone optimized
        </div>
      </div>

      {all.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sage-200 bg-white p-8 text-center shadow-sm shadow-sage-100/60 sm:py-16">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-50 text-sage-500">
            <Bell size={28} />
          </div>
          <p className="text-sm font-semibold text-sage-900">No reminders yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
            Upload your first invoice and Outskill will generate a polite WhatsApp payment follow-up automatically.
          </p>
          <div className="mx-auto mt-5 flex max-w-sm items-center justify-center gap-2 rounded-xl bg-sage-50 px-4 py-3 text-xs text-sage-700">
            <MessageSquare size={14} />
            Demo moment: generated reminder appears here as an editable chat preview.
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {all.map(reminder => (
            <ReminderCard key={reminder.id} reminder={reminder} businessName={businessName} />
          ))}
        </div>
      )}
    </div>
  );
}
