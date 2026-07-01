import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout() {
  return (
    <section className="page-shell py-16">
      <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <div className="space-y-8">
          <Outlet />
        </div>
      </div>
    </section>
  );
}
