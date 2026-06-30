import React, { useState } from 'react';
import { Mail, MapPin, Phone } from "lucide-react";
import LoadingButton from "../components/LoadingButton";
import SectionTitle from "../components/SectionTitle";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function submitContact(event) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setSent(true);
      setLoading(false);
      event.currentTarget.reset();
    }, 650);
  }

  return (
    <section className="page-shell py-16">
      <SectionTitle
        eyebrow="Concierge"
        title="Contact Aurelia"
        description="Reach the reservation desk, request event details, or coordinate luxury arrival services."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <form onSubmit={submitContact} className="bg-charcoal p-6 luxury-border md:p-8">
          {sent && <div className="mb-5 border border-champagne/40 bg-champagne/10 p-4 text-sm text-champagne">Message received. Our concierge team will respond shortly.</div>}
          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="label">Name</span>
              <input className="field" required />
            </label>
            <label>
              <span className="label">Email</span>
              <input className="field" type="email" required />
            </label>
            <label className="md:col-span-2">
              <span className="label">Subject</span>
              <input className="field" required />
            </label>
            <label className="md:col-span-2">
              <span className="label">Message</span>
              <textarea className="field min-h-36" required />
            </label>
          </div>
          <LoadingButton loading={loading} className="mt-6" type="submit">Send Message</LoadingButton>
        </form>

        <aside className="space-y-5">
          <div className="bg-ivory p-6 text-midnight">
            <h2 className="font-display text-3xl">Hotel Address</h2>
            <div className="mt-5 space-y-4 text-sm text-midnight/72">
              <p className="flex gap-3"><MapPin className="text-antique" /> Aurelia Boutique Hotel, Marine Drive, Mumbai</p>
              <p className="flex gap-3"><Phone className="text-antique" /> +91 22 4000 8899</p>
              <p className="flex gap-3"><Mail className="text-antique" /> reservations@aureliahotel.com</p>
            </div>
          </div>
          <div className="flex min-h-72 items-center justify-center border border-champagne/30 bg-white/[0.04] p-8 text-center text-ivory/62">
            Embedded Google Maps placeholder
          </div>
        </aside>
      </div>
    </section>
  );
}
