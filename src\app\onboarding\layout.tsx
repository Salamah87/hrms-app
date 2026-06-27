'use client';

import { AppShell } from '@/components/layout/app-shell';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

