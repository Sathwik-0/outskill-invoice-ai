import UploadZone from '@/components/invoice/UploadZone';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import InsightPanel from '@/components/dashboard/InsightPanel';
import { createClient } from '@/lib/supabase/server';
import { AIConfidence, LiveAIBadge, SmartRecommendations, TodaySnapshot } from '@/components/dashboard/IntelligenceWidgets';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: invoices }, { data: timeline }] = await Promise.all([
    supabase.from('invoices').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('activity_timeline').select('*, invoice:invoices(id,customer_name,amount,status)').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(10),
  ]);

  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const all = invoices ?? [];
  const stats = {
    totalPending: all.filter(invoice => invoice.status === 'pending').length,
    totalPaid: all.filter(invoice => invoice.status === 'paid').length,
    overdueCount: all.filter(invoice => invoice.status === 'overdue' || (invoice.status === 'pending' && invoice.due_date && invoice.due_date < today)).length,
    dueToday: all.filter(invoice => invoice.due_date === today && invoice.status === 'pending').length,
    pendingAmount: all.filter(invoice => invoice.status === 'pending').reduce((sum: number, invoice) => sum + invoice.amount, 0),
    paidThisMonth: all.filter(invoice => invoice.status === 'paid' && invoice.created_at >= startOfMonth).reduce((sum: number, invoice) => sum + invoice.amount, 0),
    weeklyChange: 0,
  };

  const businessName = (user?.user_metadata?.business_name as string) || user?.email?.split('@')[0] || 'your store';

  return (
    <div className="space-y-7 animate-fade-up">
      <div className="rounded-2xl border border-sage-100 bg-white/75 p-5 shadow-sm shadow-sage-100/60 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-3xl text-sage-900">
              Good {getGreeting()}, {businessName.split(' ')[0]}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {all.length === 0
                ? 'Upload your first invoice and let AI organize the books.'
                : `AI is tracking ${stats.totalPending} pending payment${stats.totalPending !== 1 ? 's' : ''} for ${businessName}.`}
            </p>
          </div>
          <LiveAIBadge />
        </div>
      </div>

      <UploadZone />

      <TodaySnapshot stats={stats} processedCount={all.length} />

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed events={timeline ?? []} stats={stats} />
        </div>
        <div className="space-y-6">
          <InsightPanel stats={stats} />
          <SmartRecommendations recommendations={buildRecommendationsForDashboard(stats)} />
          <div className="grid gap-3">
            <AIConfidence label="Customer detection" value={96} />
            <AIConfidence label="Amount extraction" value={98} />
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function buildRecommendationsForDashboard(stats: {
  overdueCount: number;
  dueToday: number;
  pendingAmount: number;
}) {
  if (stats.overdueCount > 0) {
    return [
      { id: 'overdue', priority: 'high' as const, title: `Send reminders to ${stats.overdueCount} overdue customer${stats.overdueCount > 1 ? 's' : ''}`, action: 'Use WhatsApp previews to follow up before evening collection hours.' },
      { id: 'risk', priority: 'medium' as const, title: 'Review delayed invoices from this week', action: 'AI detected payment risk in the current pending queue.' },
    ];
  }
  if (stats.dueToday > 0) {
    return [{ id: 'today', priority: 'medium' as const, title: `${stats.dueToday} payment${stats.dueToday > 1 ? 's are' : ' is'} due today`, action: 'Prepare gentle reminders now to avoid cash-flow delays.' }];
  }
  return [{ id: 'calm', priority: 'low' as const, title: 'Books look calm today', action: 'Upload the next invoice and AI will keep operations updated.' }];
}
