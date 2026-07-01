import React from 'react';
import SectionTitle from '../components/SectionTitle';

export default function AdminSettings() {
  return (
    <div className="rounded-3xl border border-white/10 bg-charcoal p-8">
      <SectionTitle eyebrow="Admin settings" title="Platform Settings" description="Configure admin controls, notifications, and system behavior." />
      <div className="mt-6 rounded-3xl border border-white/10 bg-midnight p-6 text-ivory/70">
        <p>Admin settings are coming soon. Use this area to manage hotel-wide configuration and integrations.</p>
      </div>
    </div>
  );
}
