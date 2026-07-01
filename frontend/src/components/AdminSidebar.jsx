import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Rooms', path: '/admin/rooms' },
  { label: 'Bookings', path: '/admin/bookings' },
  { label: 'Analytics', path: '/admin/analytics' },
  { label: 'Settings', path: '/admin/settings' },
];

export default function AdminSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 space-y-4 rounded-3xl border border-white/10 bg-charcoal p-6 lg:block">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.32em] text-ivory/60">Admin Panel</p>
        <h2 className="mt-3 text-3xl font-display text-champagne">Hotel Control</h2>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                isActive ? 'bg-champagne text-midnight' : 'text-ivory/80 hover:bg-white/5'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
