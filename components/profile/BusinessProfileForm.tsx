'use client';

import { useMemo, useState } from 'react';
import { Building2, Camera, Save, Smartphone, Store, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

type Profile = {
  business_name?: string;
  owner_name?: string;
  whatsapp_number?: string;
  store_type?: string;
  logo_url?: string;
};

export default function BusinessProfileForm({
  initialProfile,
  email,
}: {
  initialProfile: Profile;
  email?: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<Profile>({
    business_name: initialProfile.business_name ?? '',
    owner_name: initialProfile.owner_name ?? '',
    whatsapp_number: initialProfile.whatsapp_number ?? '',
    store_type: initialProfile.store_type ?? 'Kirana / retail store',
    logo_url: initialProfile.logo_url ?? '',
  });
  const [saving, setSaving] = useState(false);

  async function saveProfile() {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          business_name: profile.business_name?.trim() || 'My Business',
          owner_name: profile.owner_name?.trim() || '',
          whatsapp_number: profile.whatsapp_number?.trim() || '',
          store_type: profile.store_type?.trim() || '',
          logo_url: profile.logo_url?.trim() || '',
        },
      });
      if (error) throw error;
      toast.success('Business profile saved', {
        description: 'Dashboard greetings and reminders will use this identity.',
      });
    } catch (err) {
      toast.error('Could not save profile', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl border border-sage-100 bg-white p-5 shadow-sm shadow-sage-100/60">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-sage-900">Business identity</h2>
          <p className="mt-1 text-sm text-gray-500">
            Personalize the AI assistant so every dashboard, reminder, and workflow feels demo-ready.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field icon={Building2} label="Business name">
            <input
              value={profile.business_name}
              onChange={e => setProfile(p => ({ ...p, business_name: e.target.value }))}
              placeholder="Ramesh Traders"
              className="profile-input"
            />
          </Field>
          <Field icon={UserRound} label="Owner name">
            <input
              value={profile.owner_name}
              onChange={e => setProfile(p => ({ ...p, owner_name: e.target.value }))}
              placeholder="Ramesh Kumar"
              className="profile-input"
            />
          </Field>
          <Field icon={Smartphone} label="WhatsApp number">
            <input
              value={profile.whatsapp_number}
              onChange={e => setProfile(p => ({ ...p, whatsapp_number: e.target.value }))}
              placeholder="+91 98765 43210"
              className="profile-input"
            />
          </Field>
          <Field icon={Store} label="Store type">
            <select
              value={profile.store_type}
              onChange={e => setProfile(p => ({ ...p, store_type: e.target.value }))}
              className="profile-input"
            >
              <option>Kirana / retail store</option>
              <option>Wholesale trader</option>
              <option>Service business</option>
              <option>Distributor</option>
              <option>Local manufacturer</option>
            </select>
          </Field>
          <Field icon={Camera} label="Logo URL">
            <input
              value={profile.logo_url}
              onChange={e => setProfile(p => ({ ...p, logo_url: e.target.value }))}
              placeholder="https://..."
              className="profile-input"
            />
          </Field>
        </div>

        <button
          onClick={saveProfile}
          disabled={saving}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sage-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-sage-200 transition hover:bg-sage-700 disabled:opacity-60 sm:w-auto"
        >
          <Save size={16} />
          {saving ? 'Saving profile...' : 'Save profile'}
        </button>
      </div>

      <div className="rounded-2xl border border-sage-100 bg-gradient-to-br from-sage-900 to-sage-700 p-5 text-white shadow-lg shadow-sage-200/70">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/12 text-lg font-semibold">
            {(profile.business_name || 'O')[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{profile.business_name || 'My Business'}</p>
            <p className="truncate text-xs text-sage-100">{email}</p>
          </div>
        </div>
        <div className="rounded-xl bg-white/10 p-4 text-sm leading-relaxed text-sage-50 ring-1 ring-white/10">
          Hi, this is {profile.business_name || 'My Business'}. Kindly clear the pending payment when convenient. Thank you.
        </div>
        <p className="mt-4 text-xs leading-relaxed text-sage-100">
          This profile powers reminders, greetings, and AI-generated operational copy across the product.
        </p>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        <Icon size={14} />
        {label}
      </span>
      {children}
    </label>
  );
}
