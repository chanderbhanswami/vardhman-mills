'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}