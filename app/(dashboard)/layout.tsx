import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen bg-cream-50">
      <Sidebar user={user} />
      <main className="ml-0 flex-1 p-4 pb-24 sm:p-6 md:ml-64 md:max-w-5xl md:p-8">
        {children}
      </main>
    </div>
  );
}
