import React from 'react';
import { CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Confirmation() {
  const { state } = useLocation();
  const booking = state?.booking;

  if (!booking) {
    return (
      <section className="page-shell py-24 text-center">
        <h1 className="font-display text-4xl">No booking selected</h1>
        <Link to="/booking" className="btn-primary mt-8">Create Booking</Link>
      </section>
    );
  }

  return (
    <section className="page-shell py-16">
      <div className="mx-auto max-w-3xl bg-charcoal p-8 text-center luxury-border md:p-12">
        <CheckCircle2 className="mx-auto h-20 w-20 animate-pulse text-champagne" />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-champagne">
          Booking confirmed
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Your stay is reserved.</h1>
        <p className="mt-4 text-ivory/68">Booking ID: <span className="font-bold text-champagne">{booking.bookingId}</span></p>

        <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
          <Summary label="Guest" value={booking.customerName} />
          <Summary label="Status" value={booking.bookingStatus} />
          <Summary label="Room" value={booking.roomType} />
          <Summary label="Guests" value={booking.guests} />
          <Summary label="Check-in" value={booking.checkInDate} />
          <Summary label="Check-out" value={booking.checkOutDate} />
          <Summary label="Bed" value={booking.bedPreference} />
          <Summary label="Airport Pickup" value={booking.airportPickup ? "Included" : "Not requested"} />
        </div>

        {booking.specialRequests && (
          <div className="mt-4 border border-white/10 p-4 text-left">
            <p className="label">Special Requests</p>
            <p className="text-sm text-ivory/72">{booking.specialRequests}</p>
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/manage" className="btn-primary">Manage Booking</Link>
          <Link to="/rooms" className="btn-secondary">View More Rooms</Link>
        </div>
      </div>
    </section>
  );
}

function Summary({ label, value }) {
  return (
    <div className="border border-white/10 p-4">
      <p className="label">{label}</p>
      <p className="text-sm text-ivory/82">{value}</p>
    </div>
  );
}
