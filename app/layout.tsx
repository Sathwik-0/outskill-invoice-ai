import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Outskill Invoice — AI Bookkeeping for Indian Businesses',
  description: 'Automated invoice management and payment follow-ups for kirana stores and micro-businesses.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-cream-50 text-gray-900">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#f4f7f4', border: '1px solid #cddccd', color: '#273727' },
          }}
        />
      </body>
    </html>
  );
}
