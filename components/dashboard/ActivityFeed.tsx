import { formatRelativeDate } from '@/lib/utils/helpers';
import { ActivityEvent } from '@/types';
import { Upload, Brain, BookOpen, Bell, CreditCard, Inbox } from 'lucide-react';

const EVENT_ICONS: Record<string, React.ElementType> = {
  invoice_uploaded: Upload,
  ai_extracted: Brain,
  ledger_updated: BookOpen,
  reminder_generated: Bell,
  payment_received: CreditCard,
};

const EVENT_COLORS: Record<string, string> = {
  invoice_uploaded: 'bg-blue-100 text-blue-600',
  ai_extracted: 'bg-purple-100 text-purple-600',
  ledger_updated: 'bg-sage-100 text-sage-600',
  reminder_generated: 'bg-amber-100 text-amber-600',
  payment_received: 'bg-green-100 text-green-600',
};

export default function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="bg-white border border-sage-100 rounded-2xl p-5">
      <h2 className="font-medium text-sage-800 mb-4 text-sm">Activity</h2>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <Inbox size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No activity yet</p>
          <p className="text-xs text-gray-300 mt-1">Upload an invoice to see the AI workflow here</p>
        </div>
      ) : (
        <div className="space-y-0">
          {events.map((event, i) => {
            const Icon = EVENT_ICONS[event.event_type] ?? Bell;
            const colorClass = EVENT_COLORS[event.event_type] ?? 'bg-gray-100 text-gray-500';
            const isLast = i === events.length - 1;

            return (
              <div key={event.id} className="flex gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon size={13} />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-sage-100 my-1.5" />}
                </div>

                {/* Content */}
                <div className={`pb-4 min-w-0 ${isLast ? '' : ''}`}>
                  <p className="text-sm font-medium text-gray-800 leading-snug">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                  )}
                  <p className="text-xs text-gray-300 mt-1">{formatRelativeDate(event.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
