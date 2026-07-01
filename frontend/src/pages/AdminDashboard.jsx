import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import SectionTitle from '../components/SectionTitle';
import { adminApi } from '../services/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.analytics()
      .then(setAnalytics)
      .catch(() => setError('Unable to load analytics.'));
  }, []);

  if (error) {
    return (
      <section className="page-shell py-16">
        <SectionTitle eyebrow="Admin analytics" title="Dashboard Insights" description="Quick hotel performance metrics and revenue overview." />
        <div className="mt-8 rounded-3xl border border-red-400/30 bg-red-500/10 p-8 text-red-100">{error}</div>
      </section>
    );
  }

  if (!analytics) {
    return (
      <section className="page-shell py-16">
        <SectionTitle eyebrow="Admin analytics" title="Dashboard Insights" description="Quick hotel performance metrics and revenue overview." />
        <div className="mt-8 rounded-3xl border border-white/10 bg-charcoal p-8 text-ivory/70">Loading analytics...</div>
      </section>
    );
  }

  const summary = [
    { label: 'Users', value: analytics.totalUsers },
    { label: 'Rooms', value: analytics.totalRooms },
    { label: 'Available Rooms', value: analytics.availableRooms },
    { label: 'Occupied Rooms', value: analytics.occupiedRooms },
    { label: "Today's Bookings", value: analytics.todaysBookings },
    { label: 'Monthly Bookings', value: analytics.monthlyBookings },
    { label: 'Revenue', value: `₹${analytics.revenue.toLocaleString('en-IN')}` },
    { label: 'Occupancy %', value: `${analytics.occupancyPercent}%` },
  ];

  const statusChart = Object.entries(analytics.bookingCounts).map(([name, value]) => ({ name, value }));

  const revenueChart = [
    { label: 'Bookings', value: analytics.monthlyBookings },
    { label: 'Revenue', value: analytics.revenue },
  ];

  return (
    <section className="page-shell py-16">
      <SectionTitle eyebrow="Admin analytics" title="Dashboard Insights" description="Quick hotel performance metrics and revenue overview." />
      <div className="grid gap-5 xl:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="rounded-3xl border border-white/10 bg-charcoal p-6">
            <p className="text-sm uppercase tracking-[0.18em] text-ivory/60">{item.label}</p>
            <p className="mt-4 text-3xl font-display text-champagne">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-charcoal p-6">
          <h2 className="text-xl font-semibold text-ivory">Booking Status</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Bar dataKey="value" fill="#F5C547" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-charcoal p-6">
          <h2 className="text-xl font-semibold text-ivory">Revenue Trend</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="label" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#F5C547" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
