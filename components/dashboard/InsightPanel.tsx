'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/helpers';
import { DashboardStats } from '@/types';

interface InsightData {
  insight: string;
  action: string;
  urgency: 'low' | 'medium' | 'high';
}

const URGENCY_COPY = {
  low: 'Calm',
  medium: 'Watch',
  high: 'Act today',
};

const URGENCY_CLASSES = {
  low: 'border-sage-200 bg-sage-50 text-sage-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  high: 'border-red-200 bg-red-50 text-red-700',
};

export default function InsightPanel({ stats }: { stats: DashboardStats }) {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const fallbackInsight = useMemo(() => buildFallbackInsight(stats), [stats]);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setInsight(fallbackInsight);
        setLoading(false);
      }
    }, 5000);

    fetch('/api/ai/insights')
      .then(response => response.json())
      .then(({ data }) => {
        if (!cancelled && data?.insight) setInsight(data.insight);
      })
      .catch(() => {
        if (!cancelled) setInsight(fallbackInsight);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [fallbackInsight]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-full overflow-hidden rounded-2xl border border-sage-100 bg-white p-5 shadow-sm shadow-sage-100/70"
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-sage-50" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-50 text-sage-600">
              <Sparkles size={15} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-sage-900">AI Financial Pulse</h2>
              <p className="text-xs text-gray-400">Operational recommendations</p>
            </div>
          </div>
          {insight && (
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${URGENCY_CLASSES[insight.urgency]}`}>
              {URGENCY_COPY[insight.urgency]}
            </span>
          )}
        </div>

        {loading ? (
          <InsightSkeleton />
        ) : stats.totalPending === 0 && stats.totalPaid === 0 ? (
          <div className="rounded-xl border border-dashed border-sage-200 bg-sage-50/60 p-4">
            <Lightbulb size={18} className="mb-3 text-sage-600" />
            <p className="text-sm font-medium text-sage-900">
              Upload your first invoice and let AI organize your bookkeeping.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Once invoices arrive, this panel will surface overdue risk, cash flow signals, and follow-up suggestions.
            </p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-[15px] font-medium leading-relaxed text-gray-800">{insight?.insight}</p>
            <div className="flex items-start gap-2 rounded-xl border border-sage-100 bg-sage-50/70 p-3">
              <ArrowRight size={15} className="mt-0.5 shrink-0 text-sage-600" />
              <p className="text-sm leading-relaxed text-sage-800">{insight?.action}</p>
            </div>
          </motion.div>
        )}

        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-sage-50 pt-4">
          <Metric label="Pending" value={formatCurrency(stats.pendingAmount)} />
          <Metric label="Overdue" value={String(stats.overdueCount)} danger={stats.overdueCount > 0} />
          <Metric label="Due today" value={String(stats.dueToday)} warn={stats.dueToday > 0} />
        </div>
      </div>
    </motion.div>
  );
}

function InsightSkeleton() {
  return (
    <div className="space-y-3 py-1">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 size={14} className="animate-spin" />
        AI is reading your cash flow...
      </div>
      <div className="h-3 w-11/12 rounded-full shimmer-bg" />
      <div className="h-3 w-8/12 rounded-full shimmer-bg" />
      <div className="h-10 rounded-xl shimmer-bg" />
    </div>
  );
}

function Metric({ label, value, danger, warn }: { label: string; value: string; danger?: boolean; warn?: boolean }) {
  return (
    <div className="rounded-xl bg-gray-50 p-2">
      <p className="truncate text-[11px] text-gray-400">{label}</p>
      <p className={`mt-1 truncate text-sm font-semibold ${danger ? 'text-red-600' : warn ? 'text-amber-600' : 'text-sage-900'}`}>
        {value}
      </p>
    </div>
  );
}

function buildFallbackInsight(stats: DashboardStats): InsightData {
  if (stats.overdueCount > 0) {
    return {
      insight: `${stats.overdueCount} invoice${stats.overdueCount === 1 ? ' is' : 's are'} overdue this week.`,
      action: 'Send WhatsApp reminders today to protect weekend cash flow.',
      urgency: 'high',
    };
  }
  if (stats.dueToday > 0) {
    return {
      insight: `${stats.dueToday} payment${stats.dueToday === 1 ? ' is' : 's are'} due today.`,
      action: 'Prepare polite reminders before shop closing hours.',
      urgency: 'medium',
    };
  }
  if (stats.pendingAmount > 0) {
    return {
      insight: `${formatCurrency(stats.pendingAmount)} is waiting in pending collections.`,
      action: 'Review pending invoices and generate follow-ups for slow customers.',
      urgency: 'medium',
    };
  }
  return {
    insight: 'Your invoice board is calm right now.',
    action: 'Upload the next bill and Outskill will keep the ledger updated.',
    urgency: 'low',
  };
}
