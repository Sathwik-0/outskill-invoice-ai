import { createClient } from '@/lib/supabase/server';
import { formatDate, formatRelativeDate, formatCurrency } from '@/lib/utils/helpers';
import { MessageSquare, Bell } from 'lucide-react';

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

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl text-sage-900">Reminders</h1>
        <p className="text-gray-500 mt-1 text-sm">{all.length} reminder{all.length !== 1 ? 's' : ''} generated</p>
      </div>

      {all.length === 0 ? (
        <div className="bg-white border border-sage-100 rounded-2xl text-center py-16">
          <Bell size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No reminders yet</p>
          <p className="text-xs text-gray-300 mt-1">Reminders are auto-generated when you upload invoices</p>
        </div>
      ) : (
        <div className="space-y-3">
          {all.map(reminder => (
            <div key={reminder.id} className="bg-white border border-sage-100 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {(reminder.invoice as { customer_name: string })?.customer_name ?? 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatCurrency((reminder.invoice as { amount: number })?.amount ?? 0)} · {formatRelativeDate(reminder.created_at)}
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                  reminder.status === 'sent' ? 'bg-sage-100 text-sage-700' :
                  reminder.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {reminder.status}
                </span>
              </div>

              {/* Message preview */}
              <div className="bg-sage-50 border border-sage-100 rounded-lg px-4 py-3 text-sm text-gray-700 leading-relaxed">
                {reminder.message}
              </div>

              <div className="flex items-center gap-1.5 mt-3">
                <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">{reminder.channel}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
