import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Vardhman Mills Admin',
  description: 'Admin dashboard for Vardhman Mills',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}