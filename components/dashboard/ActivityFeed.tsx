'use client';

import { ActivityEvent, DashboardStats } from '@/types';
import { AIActivityTimeline, buildActivityFromEvents } from '@/components/dashboard/IntelligenceWidgets';

export default function ActivityFeed({
  events,
  stats,
}: {
  events: ActivityEvent[];
  stats?: DashboardStats;
}) {
  const fallbackStats = stats ?? {
    totalPending: 0,
    totalPaid: 0,
    overdueCount: 0,
    dueToday: 0,
    pendingAmount: 0,
    paidThisMonth: 0,
    weeklyChange: 0,
  };

  return <AIActivityTimeline events={buildActivityFromEvents(events, fallbackStats)} />;
}
