import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-6">
      <Link href="/" className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 bg-sage-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">O</span>
        </div>
        <span className="font-display text-lg text-sage-800">Outskill Invoice</span>
      </Link>
      {children}
    </div>
  );
}
