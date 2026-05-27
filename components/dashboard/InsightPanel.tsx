'use client';
import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/helpers';
import { DashboardStats } from '@/types';

interface InsightData {
  insight: string;
  action: string;
  urgency: 'low' | 'medium' | 'high';
}

const URGENCY_COLORS = {
  low: 'text-sage-600 bg-sage-50 border-sage-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  high: 'text-red-600 bg-red-50 border-red-200',
};

export default function InsightPanel({ stats }: { stats: DashboardStats }) {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stats.totalPending === 0 && stats.totalPaid === 0) {
      setLoading(false);
      return;
    }
    fetch('/api/ai/insights')
      .then(r => r.json())
      .then(({ data }) => data?.insight && setInsight(data.insight))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const urgencyColor = insight ? URGENCY_COLORS[insight.urgency] : '';

  return (
    <div className="bg-white border border-sage-100 rounded-2xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} className="text-sage-500" />
        <h2 className="font-medium text-sage-800 text-sm">AI Insight</h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <Loader2 size={14} className="animate-spin" />
          Analyzing your business…
        </div>
      ) : stats.totalPending === 0 && stats.totalPaid === 0 ? (
        <div className="text-sm text-gray-400 py-4">
          <p className="mb-2">Upload your first invoice to get AI insights about your business.</p>
        </div>
      ) : insight ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">{insight.insight}</p>
          <div className={`text-xs font-medium px-3 py-2 rounded-lg border ${urgencyColor}`}>
            → {insight.action}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400">Insight unavailable</div>
      )}

      {/* Quick stats */}
      <div className="mt-6 pt-4 border-t border-sage-50 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Pending</span>
          <span className="font-medium text-amber-600">{formatCurrency(stats.pendingAmount)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Overdue</span>
          <span className={`font-medium ${stats.overdueCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {stats.overdueCount} invoice{stats.overdueCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Due today</span>
          <span className={`font-medium ${stats.dueToday > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
            {stats.dueToday} invoice{stats.dueToday !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
