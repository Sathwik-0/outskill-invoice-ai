import Link from 'next/link';
import { Bot, Camera, MessageSquare } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-cream-50">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-500">
            <span className="text-sm font-bold text-white">O</span>
          </div>
          <span className="font-display text-lg text-sage-800">Outskill Invoice</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-sage-600 transition-colors hover:text-sage-800">
            Sign in
          </Link>
          <Link href="/signup" className="rounded-lg bg-sage-500 px-4 py-2 text-sm text-white transition-colors hover:bg-sage-600">
            Get started
          </Link>
        </div>
      </nav>

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-sage-200 bg-sage-100 px-3 py-1.5 text-xs font-medium text-sage-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage-500" />
          AI-powered bookkeeping for Indian businesses
        </div>

        <h1 className="mb-6 max-w-3xl font-display text-5xl leading-tight text-sage-900 md:text-7xl">
          Invoice management
          <span className="italic text-sage-500"> quietly automated</span>
        </h1>

        <p className="mb-10 max-w-xl text-lg leading-relaxed text-gray-500">
          Upload an invoice. AI extracts, files, updates the ledger, and prepares WhatsApp follow-ups automatically.
          Built for kirana stores and Indian micro-businesses.
        </p>

        <Link
          href="/signup"
          className="rounded-xl bg-sage-500 px-8 py-4 text-lg font-medium text-white transition-all hover:bg-sage-600 hover:shadow-lg hover:shadow-sage-200 active:scale-95"
        >
          Start for free
        </Link>

        <p className="mt-4 text-sm text-gray-400">No credit card required</p>

        <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { Icon: Camera, title: 'Upload invoice', desc: 'Photo or PDF. AI reads the details.' },
            { Icon: Bot, title: 'AI extracts and files', desc: 'Amount, customer, category, and due date.' },
            { Icon: MessageSquare, title: 'Smart reminders', desc: 'WhatsApp follow-ups generated instantly.' },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-sage-100 bg-white/75 p-5 text-left shadow-sm shadow-sage-100/60">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-sage-50 text-sage-600">
                <Icon size={18} />
              </div>
              <div className="mb-1 font-medium text-sage-800">{title}</div>
              <div className="text-sm leading-relaxed text-gray-500">{desc}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
