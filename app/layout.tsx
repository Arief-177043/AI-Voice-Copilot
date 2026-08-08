import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AppShell } from '@/components/app-shell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SalesAI Co-Pilot — AI Voice Assistant for Inside Sales',
  description:
    'AI-powered voice co-pilot for inside sales agents selling Pay-in-3 Zero-Cost EMI. Real-time objection detection, grounded product answers, and automated CRM updates.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
