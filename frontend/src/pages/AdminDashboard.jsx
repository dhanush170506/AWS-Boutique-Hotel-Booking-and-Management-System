import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import SectionTitle from '../components/SectionTitle';
import { adminApi } from '../services/api';

const chartColors = ['#F5C547', '#E7B83B', '#C58A11', '#7C4A06', '#F1B54A', '#9F7E2A'];

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

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
        <SectionTitle eyebrow="Admin analytics" title="Dashboard Insights" description="Monitor hotel performance with live analytics derived from your existing records." />
        <div className="mt-8 rounded-3xl border border-red-400/30 bg-red-500/10 p-8 text-red-100">{error}</div>
      </section>
    );
  }

  if (!analytics) {
    return (
      <section className="page-shell py-16">
        <SectionTitle eyebrow="Admin analytics" title="Dashboard Insights" description="Monitor hotel performance with live analytics derived from your existing records." />
        <div className="mt-8 rounded-3xl border border-white/10 bg-charcoal p-8 text-ivory/70">Loading analytics...</div>
      </section>
    );
  }

  const summary = [
    { label: 'Total Users', value: analytics.totalUsers ?? 0 },
    { label: 'Total Rooms', value: analytics.totalRooms ?? 0 },
    { label: 'Available Rooms', value: analytics.availableRooms ?? 0 },
    { label: 'Occupied Rooms', value: analytics.occupiedRooms ?? 0 },
    { label: 'Occupancy Rate (%)', value: `${analytics.occupancyPercent ?? 0}%` },
    { label: 'Total Bookings', value: analytics.totalBookings ?? analytics.monthlyBookings ?? 0 },
    { label: 'Active Bookings', value: analytics.activeBookings ?? 0 },
    { label: 'Cancelled Bookings', value: analytics.cancelledBookings ?? 0 },
    { label: 'Total Revenue', value: formatCurrency(analytics.revenue ?? 0) },
    { label: 'Average Revenue per Booking', value: formatCurrency(analytics.averageRevenuePerBooking ?? 0) },
  ];

  const monthlyBookingsSeries = analytics.monthlyBookingsSeries || [];
  const monthlyRevenueSeries = analytics.monthlyRevenueSeries || [];
  const occupancyData = analytics.occupancyData || [];
  const roomTypeDistribution = analytics.roomTypeDistribution || [];

  return (
    <section className="page-shell py-16">
      <SectionTitle eyebrow="Admin analytics" title="Dashboard Insights" description="Monitor hotel performance with live analytics derived from your existing records." />

      <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-5">
        {summary.map((item) => (
          <div key={item.label} className="rounded-3xl border border-white/10 bg-charcoal p-6 shadow-lg shadow-midnight/30">
            <p className="text-sm uppercase tracking-[0.18em] text-ivory/60">{item.label}</p>
            <p className="mt-4 text-2xl font-display text-champagne">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-charcoal p-6">
          <h2 className="text-xl font-semibold text-ivory">Monthly Bookings</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyBookingsSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="month" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#F5C547" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-charcoal p-6">
          <h2 className="text-xl font-semibold text-ivory">Monthly Revenue</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="month" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#F5C547" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-charcoal p-6">
          <h2 className="text-xl font-semibold text-ivory">Room Occupancy</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={occupancyData} dataKey="value" nameKey="name" outerRadius={100} label>
                  <Cell fill="#F5C547" />
                  <Cell fill="#2D3A46" />
                </Pie>
                <Tooltip formatter={(value) => value} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-charcoal p-6">
          <h2 className="text-xl font-semibold text-ivory">Room Type Distribution</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomTypeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#F5C547" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
