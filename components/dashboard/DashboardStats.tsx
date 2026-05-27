import { formatCurrency } from '@/lib/utils/helpers';
import { DashboardStats as Stats } from '@/types';
import { Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

export default function DashboardStats({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: 'Pending Collections',
      value: formatCurrency(stats.pendingAmount),
      sub: `${stats.totalPending} invoice${stats.totalPending !== 1 ? 's' : ''}`,
      Icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      label: 'Collected',
      value: formatCurrency(stats.paidThisMonth),
      sub: `${stats.totalPaid} paid`,
      Icon: CheckCircle,
      color: 'text-sage-600',
      bg: 'bg-sage-50',
      border: 'border-sage-100',
    },
    {
      label: 'Overdue',
      value: String(stats.overdueCount),
      sub: 'need follow-up',
      Icon: AlertTriangle,
      color: stats.overdueCount > 0 ? 'text-red-600' : 'text-gray-400',
      bg: stats.overdueCount > 0 ? 'bg-red-50' : 'bg-gray-50',
      border: stats.overdueCount > 0 ? 'border-red-100' : 'border-gray-100',
    },
    {
      label: 'Due Today',
      value: String(stats.dueToday),
      sub: 'invoices',
      Icon: Calendar,
      color: stats.dueToday > 0 ? 'text-orange-600' : 'text-gray-400',
      bg: stats.dueToday > 0 ? 'bg-orange-50' : 'bg-gray-50',
      border: stats.dueToday > 0 ? 'border-orange-100' : 'border-gray-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {cards.map(({ label, value, sub, Icon, color, bg, border }) => (
        <div key={label} className={`rounded-xl border ${border} bg-white p-4 shadow-sm shadow-sage-100/60 transition-all hover:-translate-y-0.5 hover:shadow-md`}>
          <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
            <Icon size={16} className={color} />
          </div>
          <div className="break-words font-display text-xl text-gray-900">{value}</div>
          <div className="mt-0.5 text-xs text-gray-500">{label}</div>
          <div className="mt-0.5 text-xs text-gray-400">{sub}</div>
        </div>
      ))}
    </div>
  );
}
