'use client';

import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="lg:pl-64">
          <AdminHeader setSidebarOpen={setSidebarOpen} />
          <main className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
