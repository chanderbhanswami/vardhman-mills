'use client';
import { useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from '@/store';

export function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render only children during SSR to prevent hydration mismatches
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <SessionProvider>
      <Provider store={store}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </Provider>
    </SessionProvider>
  );
}