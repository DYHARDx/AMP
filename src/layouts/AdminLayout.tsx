import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';

interface AdminLayoutProps { children: ReactNode; }

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="relative min-h-full">
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          <div className="relative z-10 p-6 md:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
