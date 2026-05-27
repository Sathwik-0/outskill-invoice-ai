import BusinessProfileForm from '@/components/profile/BusinessProfileForm';
import { createClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user?.user_metadata ?? {};

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl text-sage-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Keep the assistant personalized for your store and WhatsApp workflows.
        </p>
      </div>
      <BusinessProfileForm initialProfile={profile} email={user?.email} />
    </div>
  );
}
