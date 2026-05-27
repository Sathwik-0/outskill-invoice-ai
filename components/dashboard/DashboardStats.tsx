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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, Icon, color, bg, border }) => (
        <div key={label} className={`bg-white border ${border} rounded-xl p-4`}>
          <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}>
            <Icon size={16} className={color} />
          </div>
          <div className="font-display text-xl text-gray-900">{value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
        </div>
      ))}
    </div>
  );
}
