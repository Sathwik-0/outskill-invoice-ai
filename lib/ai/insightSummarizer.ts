import { callGroqJSON } from '@/lib/ai/groq';
import { DashboardStats } from '@/types';

const SYSTEM_PROMPT = `You are a financial insight AI for Indian micro-businesses and kirana stores.
Generate a single, actionable insight in plain Hindi-English (Hinglish) or simple English.
Keep it under 100 characters. Be specific with numbers. Sound helpful, not alarming.`;

interface InsightOutput {
  insight: string;
  action: string;
  urgency: 'low' | 'medium' | 'high';
}

export async function generateInsight(stats: DashboardStats): Promise<InsightOutput> {
  const context = `
Pending payments: ₹${stats.pendingAmount.toLocaleString('en-IN')}
Overdue invoices: ${stats.overdueCount}
Due today: ${stats.dueToday}
Paid this month: ₹${stats.paidThisMonth.toLocaleString('en-IN')}
Weekly change: ${stats.weeklyChange > 0 ? '+' : ''}${stats.weeklyChange}%
  `.trim();

  return callGroqJSON<InsightOutput>(
    SYSTEM_PROMPT,
    `Generate business insight for:\n${context}\n\nReturn JSON with: insight (the message), action (what to do), urgency (low/medium/high)`,
    { maxTokens: 200 }
  );
}
