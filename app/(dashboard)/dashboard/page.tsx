import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatRelativeDate } from '@/lib/utils/helpers';
import UploadZone from '@/components/invoice/UploadZone';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import InsightPanel from '@/components/dashboard/InsightPanel';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: invoices }, { data: timeline }] = await Promise.all([
    supabase.from('invoices').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('activity_timeline').select('*, invoice:invoices(id,customer_name,amount,status)').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(10),
  ]);

  const today = new Date().toISOString().split('T')[0];
  const all = invoices ?? [];
  const stats = {
    totalPending: all.filter(i => i.status === 'pending').length,
    totalPaid: all.filter(i => i.status === 'paid').length,
    overdueCount: all.filter(i => i.status === 'overdue' || (i.status === 'pending' && i.due_date && i.due_date < today)).length,
    dueToday: all.filter(i => i.due_date === today && i.status === 'pending').length,
    pendingAmount: all.filter(i => i.status === 'pending').reduce((s: number, i) => s + i.amount, 0),
    paidThisMonth: 0,
    weeklyChange: 0,
  };

  const businessName = (user?.user_metadata?.business_name as string) || 'your store';

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-sage-900">
          Good {getGreeting()}, {businessName.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {all.length === 0
            ? 'Upload your first invoice to get started.'
            : `You have ${stats.totalPending} pending payment${stats.totalPending !== 1 ? 's' : ''}.`}
        </p>
      </div>

      {/* Upload — Primary Action */}
      <UploadZone />

      {/* Stats */}
      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed events={timeline ?? []} />
        </div>

        {/* AI Insight Panel */}
        <div>
          <InsightPanel stats={stats} />
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
