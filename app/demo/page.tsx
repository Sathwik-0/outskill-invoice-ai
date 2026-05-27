import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';
import DashboardStats from '@/components/dashboard/DashboardStats';
import InsightPanel from '@/components/dashboard/InsightPanel';
import {
  AIActivityTimeline,
  AIConfidence,
  LiveAIBadge,
  SmartRecommendations,
  TodaySnapshot,
} from '@/components/dashboard/IntelligenceWidgets';
import { DashboardStats as Stats } from '@/types';

const stats: Stats = {
  totalPending: 7,
  totalPaid: 18,
  overdueCount: 3,
  dueToday: 2,
  pendingAmount: 86450,
  paidThisMonth: 142800,
  weeklyChange: 18,
};

const now = Date.now();
const activities = [
  { id: 'a1', type: 'extract' as const, title: 'AI extracted Rs 12,450 from Invoice #204', detail: 'Customer detected: Ramesh Traders', confidence: 97, created_at: new Date(now - 4 * 60000).toISOString() },
  { id: 'a2', type: 'reminder' as const, title: 'Reminder generated for Ravi Stores', detail: 'Tone optimized for polite WhatsApp follow-up', confidence: 95, created_at: new Date(now - 11 * 60000).toISOString() },
  { id: 'a3', type: 'ledger' as const, title: 'Ledger updated automatically', detail: 'Inventory purchase filed under pending collections', confidence: 98, created_at: new Date(now - 22 * 60000).toISOString() },
  { id: 'a4', type: 'risk' as const, title: '3 invoices flagged as overdue', detail: 'AI recommends follow-up before 6 PM', confidence: 94, created_at: new Date(now - 38 * 60000).toISOString() },
  { id: 'a5', type: 'category' as const, title: 'AI categorized invoice as Inventory', detail: 'Matched common kirana wholesale pattern', confidence: 96, created_at: new Date(now - 52 * 60000).toISOString() },
];

const recommendations = [
  { id: 'r1', priority: 'high' as const, title: 'Send reminders to 3 overdue customers', action: 'AI suggests WhatsApp follow-ups before 6 PM to improve cash collection.' },
  { id: 'r2', priority: 'medium' as const, title: 'Follow up with Ravi Stores tomorrow', action: 'This customer frequently clears payments after a polite second reminder.' },
  { id: 'r3', priority: 'medium' as const, title: 'Review delayed invoices from this week', action: 'Two inventory invoices are moving toward high-risk collection status.' },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-cream-50 p-4 pb-10 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-3xl border border-sage-100 bg-gradient-to-br from-white via-sage-50/70 to-cream-100 p-5 shadow-sm shadow-sage-100/70 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <LiveAIBadge label="deterministic demo mode" />
                <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  No live API dependency
                </span>
              </div>
              <h1 className="font-display text-4xl leading-tight text-sage-950 sm:text-5xl">
                Ramesh Traders AI finance desk
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
                A complete Indian SMB demo workspace showing invoice extraction, bookkeeping automation,
                payment reminder orchestration, and proactive financial recommendations.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sage-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sage-200 transition hover:bg-sage-800 sm:w-auto"
            >
              Try live app
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <TodaySnapshot stats={stats} processedCount={25} />
        <DashboardStats stats={stats} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AIActivityTimeline events={activities} />
            <div className="grid gap-3 sm:grid-cols-3">
              <AIConfidence label="Customer detected" value={97} />
              <AIConfidence label="Amount verified" value={98} />
              <AIConfidence label="Due date recognized" value={94} />
            </div>
          </div>
          <div className="space-y-6">
            <InsightPanel stats={stats} />
            <SmartRecommendations recommendations={recommendations} />
            <div className="rounded-2xl border border-sage-100 bg-white p-5 shadow-sm shadow-sage-100/60">
              <Store size={18} className="mb-3 text-sage-600" />
              <p className="text-sm font-semibold text-sage-900">Demo business profile</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Kirana wholesale supplier · Bengaluru · WhatsApp-first collections workflow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
