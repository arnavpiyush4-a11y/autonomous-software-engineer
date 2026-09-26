import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import CommandPalette from '@/components/ui/CommandPalette';

export const metadata: Metadata = {
  title: 'ReleasePilot AI — Autonomous Engineering Agent',
  description: 'Autonomous AI software-engineering agent that takes repositories from problem discovery to verified release readiness.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-bg-base text-text-primary font-sans antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <DemoModeBanner />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
        {/* Global command palette — ⌘K / Ctrl+K */}
        <CommandPalette />
      </body>
    </html>
  );
}
