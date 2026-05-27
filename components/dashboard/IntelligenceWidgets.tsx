'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Brain,
  CheckCircle2,
  IndianRupee,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Upload,
  Zap,
} from 'lucide-react';
import { ActivityEvent, DashboardStats } from '@/types';
import { formatCurrency, formatRelativeDate } from '@/lib/utils/helpers';

export type AIActivityItem = {
  id: string;
  type: 'extract' | 'reminder' | 'ledger' | 'risk' | 'category' | 'upload' | 'paid';
  title: string;
  detail?: string;
  confidence?: number;
  created_at: string;
};

export type Recommendation = {
  id: string;
  title: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
};

const ICONS = {
  extract: Brain,
  reminder: MessageSquare,
  ledger: BookOpen,
  risk: AlertTriangle,
  category: Sparkles,
  upload: Upload,
  paid: CheckCircle2,
};

const COLORS = {
  extract: 'bg-violet-50 text-violet-600 border-violet-100',
  reminder: 'bg-amber-50 text-amber-600 border-amber-100',
  ledger: 'bg-sage-50 text-sage-600 border-sage-100',
  risk: 'bg-red-50 text-red-600 border-red-100',
  category: 'bg-blue-50 text-blue-600 border-blue-100',
  upload: 'bg-gray-50 text-gray-600 border-gray-100',
  paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

export function LiveAIBadge({ label = 'AI operations live' }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-sage-100 bg-white/85 px-3 py-1.5 text-xs font-semibold text-sage-700 shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      {label}
    </div>
  );
}

export function AIConfidence({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-sage-100 bg-white/80 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className="text-xs font-semibold text-sage-700">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-sage-50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-sage-400 to-emerald-400"
        />
      </div>
    </div>
  );
}

export function TodaySnapshot({ stats, processedCount = 0 }: { stats: DashboardStats; processedCount?: number }) {
  const cards = [
    { label: 'Pending Collections', value: stats.pendingAmount, type: 'money' as const, icon: IndianRupee, tone: 'sage' },
    { label: 'Invoices Processed', value: processedCount || stats.totalPending + stats.totalPaid, type: 'number' as const, icon: Upload, tone: 'blue' },
    { label: 'AI Accuracy', value: 96, suffix: '%', type: 'number' as const, icon: Brain, tone: 'violet' },
    { label: 'Follow-Ups Suggested', value: Math.max(stats.overdueCount, stats.dueToday), type: 'number' as const, icon: Bell, tone: 'amber' },
    { label: 'Revenue This Week', value: stats.paidThisMonth || Math.round(stats.pendingAmount * 0.42), type: 'money' as const, icon: TrendingUp, tone: 'emerald' },
  ];

  return (
    <section className="rounded-2xl border border-sage-100 bg-white/80 p-5 shadow-sm shadow-sage-100/60">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-sage-900">Today's Business Snapshot</h2>
          <p className="mt-1 text-xs text-gray-500">AI-read operating view for the day.</p>
        </div>
        <LiveAIBadge label="syncing signals" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map(card => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-sage-100 bg-gradient-to-br from-white to-sage-50/50 p-3"
          >
            <card.icon size={16} className={toneClass(card.tone)} />
            <div className="mt-3 min-h-7 font-display text-xl text-sage-950">
              <CountUp value={card.value} type={card.type} suffix={card.suffix} />
            </div>
            <p className="mt-1 text-xs leading-snug text-gray-500">{card.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function AIActivityTimeline({
  events,
  loading = false,
}: {
  events: AIActivityItem[];
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-sage-100 bg-white p-5 shadow-sm shadow-sage-100/60">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-sage-900">AI Activity Feed</h2>
          <p className="mt-1 text-xs text-gray-500">Live bookkeeping operations completed by the assistant.</p>
        </div>
        <Zap size={16} className="text-amber-500" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(item => <div key={item} className="h-12 rounded-xl shimmer-bg" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-sage-200 bg-sage-50/50 p-6 text-center">
          <Brain size={28} className="mx-auto mb-3 text-sage-400" />
          <p className="text-sm font-medium text-sage-900">AI activity will appear here</p>
          <p className="mt-1 text-xs text-gray-500">Upload invoices to watch extraction, ledger, and reminder actions.</p>
        </div>
      ) : (
        <div className="space-y-0">
          {events.map((event, index) => {
            const Icon = ICONS[event.type];
            const isLast = index === events.length - 1;
            return (
              <motion.div key={event.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${COLORS[event.type]}`}>
                    <Icon size={14} />
                  </div>
                  {!isLast && <div className="my-1.5 w-px flex-1 bg-sage-100" />}
                </div>
                <div className="min-w-0 flex-1 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-snug text-gray-800">{event.title}</p>
                    {event.confidence && <span className="shrink-0 rounded-full bg-sage-50 px-2 py-0.5 text-[11px] font-semibold text-sage-700">{event.confidence}%</span>}
                  </div>
                  {event.detail && <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{event.detail}</p>}
                  <p className="mt-1 text-xs text-gray-300">{formatRelativeDate(event.created_at)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SmartRecommendations({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <div className="rounded-2xl border border-sage-100 bg-white p-5 shadow-sm shadow-sage-100/60">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={15} className="text-sage-600" />
        <h2 className="text-sm font-semibold text-sage-900">Smart AI Recommendations</h2>
      </div>
      <div className="space-y-3">
        {recommendations.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-sage-100 bg-gradient-to-br from-white to-sage-50/40 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${priorityClass(item.priority)}`}>
                {item.priority}
              </span>
              <span className="text-[11px] font-semibold text-sage-600">AI</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.action}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function buildActivityFromEvents(events: ActivityEvent[], stats: DashboardStats): AIActivityItem[] {
  const mapped = events.slice(0, 5).map(event => ({
    id: event.id,
    type: mapEventType(event.event_type),
    title: cleanTitle(event.title),
    detail: event.description ?? undefined,
    confidence: event.event_type === 'ai_extracted' ? 96 : undefined,
    created_at: event.created_at,
  }));

  if (stats.overdueCount > 0) {
    mapped.unshift({
      id: 'risk-overdue',
      type: 'risk',
      title: `${stats.overdueCount} invoices flagged as overdue`,
      detail: 'AI recommends sending payment reminders today.',
      confidence: 94,
      created_at: new Date().toISOString(),
    });
  }

  return mapped;
}

export function buildRecommendations(stats: DashboardStats): Recommendation[] {
  const items: Recommendation[] = [];
  if (stats.overdueCount > 0) {
    items.push({ id: 'overdue', priority: 'high', title: `Send reminders to ${stats.overdueCount} overdue customer${stats.overdueCount > 1 ? 's' : ''}`, action: 'Use the WhatsApp preview to follow up before evening collection hours.' });
  }
  if (stats.dueToday > 0) {
    items.push({ id: 'today', priority: 'medium', title: `${stats.dueToday} payment${stats.dueToday > 1 ? 's are' : ' is'} due today`, action: 'Prepare gentle reminders now to avoid weekend cash-flow delays.' });
  }
  if (stats.pendingAmount > 0) {
    items.push({ id: 'pending', priority: 'medium', title: 'Review delayed invoices from this week', action: `${formatCurrency(stats.pendingAmount)} is still pending across active invoices.` });
  }
  return items.length ? items.slice(0, 3) : [
    { id: 'calm', priority: 'low', title: 'Books look calm today', action: 'Upload the next invoice and the AI assistant will keep operations updated.' },
  ];
}

function CountUp({ value, type, suffix = '' }: { value: number; type: 'money' | 'number'; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame = 0;
    const total = 24;
    const timer = window.setInterval(() => {
      frame += 1;
      setDisplay(Math.round(value * (frame / total)));
      if (frame >= total) window.clearInterval(timer);
    }, 22);
    return () => window.clearInterval(timer);
  }, [value]);

  return <>{type === 'money' ? formatCurrency(display) : `${display}${suffix}`}</>;
}

function mapEventType(type: string): AIActivityItem['type'] {
  if (type === 'invoice_uploaded') return 'upload';
  if (type === 'ai_extracted') return 'extract';
  if (type === 'ledger_updated') return 'ledger';
  if (type === 'reminder_generated') return 'reminder';
  if (type === 'payment_received') return 'paid';
  return 'category';
}

function cleanTitle(title: string) {
  return title.replace('â‚¹', 'Rs ');
}

function priorityClass(priority: Recommendation['priority']) {
  if (priority === 'high') return 'bg-red-50 text-red-700';
  if (priority === 'medium') return 'bg-amber-50 text-amber-700';
  return 'bg-sage-50 text-sage-700';
}

function toneClass(tone: string) {
  return {
    sage: 'text-sage-600',
    blue: 'text-blue-600',
    violet: 'text-violet-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
  }[tone] ?? 'text-sage-600';
}
