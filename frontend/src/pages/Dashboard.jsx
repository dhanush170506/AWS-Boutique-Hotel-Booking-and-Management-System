import React, { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, ClipboardList, Hotel, BellRing, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";
import { bookingApi } from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    bookingApi.listByUser(user.id).then(setBookings).catch(() => setBookings([]));
  }, [user.id]);

  const upcomingBookings = useMemo(
    () => bookings.filter((booking) => booking.bookingStatus !== "Cancelled" && new Date(booking.checkInDate) >= new Date()),
    [bookings]
  );
  const nextStay = upcomingBookings[0] || null;

  const cards = [
    ["Total Bookings", bookings.length, ClipboardList],
    ["Upcoming Stays", upcomingBookings.length, CalendarCheck],
    ["Active Reservations", bookings.filter((booking) => booking.bookingStatus !== "Cancelled").length, Hotel],
  ];

  const notifications = [
    "Your check-in window opens 24 hours before arrival.",
    "Breakfast and room service are available for all stays.",
    "You can edit your reservation up to 48 hours before arrival.",
  ];

  return (
    <section className="page-shell py-16">
      <SectionTitle eyebrow="Dashboard" title={`Welcome back, ${user.fullName}`} description="Here is a polished snapshot of your upcoming stays and hotel experience." />

      <div className="grid gap-5 md:grid-cols-3">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="bg-charcoal p-6 luxury-border">
            <Icon className="text-champagne" />
            <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-ivory/55">{label}</p>
            <p className="mt-2 font-display text-4xl text-champagne">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="bg-charcoal p-6 luxury-border">
          <h2 className="font-display text-3xl text-champagne">Upcoming Booking</h2>
          {nextStay ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-midnight/70 p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-champagne">{nextStay.roomName || nextStay.roomType}</p>
              <p className="mt-2 text-xl font-semibold text-ivory">{nextStay.checkInDate} → {nextStay.checkOutDate}</p>
              <p className="mt-2 text-sm text-ivory/70">Booking ID: {nextStay.bookingId}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/booking" className="btn-primary">Quick Book Room</Link>
                <Link to="/my-bookings" className="btn-secondary">View All Bookings</Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-8 text-center text-ivory/70">
              No upcoming reservation yet. Start with a premium experience by booking your next stay.
            </div>
          )}
        </div>

        <div className="bg-charcoal p-6 luxury-border">
          <div className="flex items-center gap-3"><BellRing className="text-champagne" /><h2 className="font-display text-3xl text-champagne">Recent notifications</h2></div>
          <div className="mt-5 space-y-3 text-sm text-ivory/75">
            {notifications.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-midnight/70 p-4">
                <Sparkles className="mt-0.5 text-champagne" size={16} />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
