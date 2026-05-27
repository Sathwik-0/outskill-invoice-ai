import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream-50 flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sage-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">O</span>
          </div>
          <span className="font-display text-lg text-sage-800">Outskill Invoice</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-sage-600 hover:text-sage-800 px-4 py-2 transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="text-sm bg-sage-500 text-white px-4 py-2 rounded-lg hover:bg-sage-600 transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-sage-100 text-sage-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8 border border-sage-200">
          <span className="w-1.5 h-1.5 bg-sage-500 rounded-full animate-pulse"></span>
          AI-powered bookkeeping for Indian businesses
        </div>

        <h1 className="font-display text-5xl md:text-7xl text-sage-900 leading-tight max-w-3xl mb-6">
          Invoice management
          <span className="italic text-sage-500"> quietly automated</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed">
          Upload an invoice. Our AI extracts, categorizes, and follows up — automatically. 
          Built for kirana stores and Indian micro-businesses.
        </p>

        <Link
          href="/signup"
          className="bg-sage-500 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-sage-600 transition-all hover:shadow-lg hover:shadow-sage-200 active:scale-95"
        >
          Start for free →
        </Link>

        <p className="text-sm text-gray-400 mt-4">No credit card required</p>

        {/* Feature hints */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 max-w-3xl w-full">
          {[
            { emoji: '📸', title: 'Upload invoice', desc: 'Photo or PDF — AI reads everything' },
            { emoji: '🤖', title: 'AI extracts & files', desc: 'Amount, customer, category — automatic' },
            { emoji: '💬', title: 'Smart reminders', desc: 'WhatsApp follow-ups generated instantly' },
          ].map((f) => (
            <div key={f.title} className="bg-white/70 border border-sage-100 rounded-xl p-5 text-left">
              <div className="text-2xl mb-3">{f.emoji}</div>
              <div className="font-medium text-sage-800 mb-1">{f.title}</div>
              <div className="text-sm text-gray-500">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
