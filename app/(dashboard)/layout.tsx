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
      <main className="flex-1 ml-0 md:ml-64 p-6 md:p-8 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
