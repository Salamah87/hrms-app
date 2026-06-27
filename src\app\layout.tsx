import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { RootLayout as ClientRootLayout } from '@/components/layout/root-layout';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'PulseHR - Human Resource Management System',
    template: '%s | PulseHR',
  },
  description: 'Enterprise Human Resource Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientRootLayout>{children}</ClientRootLayout>
      </body>
    </html>
  );
}
