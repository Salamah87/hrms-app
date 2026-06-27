'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/hooks/use-auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RtlToaster() {
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    const check = () => {
      const rtl = document.documentElement.dir === 'rtl';
      setIsRtl(rtl);
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => observer.disconnect();
  }, []);

  return (
    <Toaster
      position={isRtl ? 'top-left' : 'top-right'}
      toastOptions={{
        duration: 4000,
        style: { direction: isRtl ? 'rtl' : 'ltr' },
      }}
    />
  );
}

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <RtlToaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
