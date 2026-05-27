'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', businessName: '' });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { business_name: form.businessName } },
      });
      if (error) throw error;
      toast.success('Account created! Signing you in…');
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (loginError) throw loginError;
      router.push('/dashboard');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-sage-100 rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl text-sage-900 mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-8">Start automating your bookkeeping</p>

        <form onSubmit={handleSignup} className="space-y-4">
          {[
            { key: 'businessName', label: 'Business Name', type: 'text', placeholder: 'Ramesh Kirana Store' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@business.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={set(key)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400 transition-all"
                placeholder={placeholder}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage-500 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-sage-600 disabled:opacity-60 transition-colors mt-2"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
      <p className="text-center text-sm text-gray-500 mt-4">
        Have an account?{' '}
        <Link href="/login" className="text-sage-600 hover:text-sage-800 font-medium">
          Sign in →
        </Link>
      </p>
    </div>
  );
}
