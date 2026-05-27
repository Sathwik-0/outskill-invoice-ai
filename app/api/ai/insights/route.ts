import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateInsight } from '@/lib/ai/insightSummarizer';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get stats
    const { data: invoices } = await supabase
      .from('invoices')
      .select('amount, status, due_date, created_at')
      .eq('user_id', user.id);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

    const all = invoices ?? [];
    const pendingAmount = all.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
    const overdueCount = all.filter(i => i.status === 'overdue' || (i.status === 'pending' && i.due_date && i.due_date < today)).length;
    const dueToday = all.filter(i => i.due_date === today && i.status === 'pending').length;
    const paidThisMonth = all.filter(i => i.status === 'paid' && i.created_at >= startOfMonth).reduce((s, i) => s + i.amount, 0);
    const recentPending = all.filter(i => i.status === 'pending' && i.created_at >= weekAgo).length;
    const weeklyChange = all.length > 0 ? Math.round((recentPending / Math.max(all.length, 1)) * 100) : 0;

    const stats = { totalPending: all.filter(i => i.status === 'pending').length, totalPaid: all.filter(i => i.status === 'paid').length, overdueCount, dueToday, pendingAmount, paidThisMonth, weeklyChange };

    const insight = await withTimeout(generateInsight(stats), 12000).catch(() => ({
      insight: stats.overdueCount > 0
        ? `${stats.overdueCount} invoices need payment follow-up today.`
        : `${stats.totalPending} invoices are being monitored by AI.`,
      action: stats.overdueCount > 0
        ? 'Send WhatsApp reminders before evening collection hours.'
        : 'Upload new invoices to keep the ledger current.',
      urgency: stats.overdueCount > 0 ? 'high' : 'low',
    }));
    return NextResponse.json({ data: { stats, insight }, error: null });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Insight generation timed out')), ms);
    promise.then(resolve).catch(reject).finally(() => clearTimeout(timer));
  });
}
