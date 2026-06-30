import React, { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, ClipboardList, Hotel } from "lucide-react";
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
    () =>
      bookings.filter(
        (booking) =>
          booking.bookingStatus !== "Cancelled" && new Date(booking.checkInDate) >= new Date()
      ),
    [bookings]
  );
  const activeBookings = bookings.filter((booking) => booking.bookingStatus !== "Cancelled");

  const cards = [
    ["Total Bookings", bookings.length, ClipboardList],
    ["Upcoming Stays", upcomingBookings.length, CalendarCheck],
    ["Active Reservations", activeBookings.length, Hotel]
  ];

  return (
    <section className="page-shell py-16">
      <SectionTitle eyebrow="Dashboard" title={`Welcome, ${user.fullName}`} description="Review your reservations and recent activity." />
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="bg-charcoal p-6 luxury-border">
            <Icon className="text-champagne" />
            <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-ivory/55">{label}</p>
            <p className="mt-2 font-display text-4xl text-champagne">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-charcoal p-6 luxury-border">
        <h2 className="font-display text-3xl text-champagne">Recent Activity</h2>
        <div className="mt-5 space-y-3 text-sm text-ivory/72">
          {bookings.slice(0, 4).map((booking) => (
            <p key={booking.bookingId}>
              {booking.bookingId} - {booking.roomType} is {booking.bookingStatus}.
            </p>
          ))}
          {!bookings.length && <p>No booking activity yet.</p>}
        </div>
      </div>
    </section>
  );
}
