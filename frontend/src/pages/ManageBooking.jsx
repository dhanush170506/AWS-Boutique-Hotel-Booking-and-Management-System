import React, { useState } from 'react';
import { Search, Trash2 } from "lucide-react";
import LoadingButton from "../components/LoadingButton";
import SectionTitle from "../components/SectionTitle";
import { bookingApi } from "../services/api";

export default function ManageBooking() {
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState(null);
  const [specialRequests, setSpecialRequests] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchBooking(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBooking(null);
    try {
      setLoading(true);
      const result = await bookingApi.get(bookingId.trim());
      setBooking(result);
      setSpecialRequests(result.specialRequests || "");
    } catch (err) {
      setError(err.response?.data?.message || "Booking not found.");
    } finally {
      setLoading(false);
    }
  }

  async function updateRequests() {
    setError("");
    setMessage("");
    try {
      setLoading(true);
      const result = await bookingApi.update(booking.bookingId, { specialRequests });
      setBooking(result);
      setMessage("Special requests updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update booking.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking() {
    setError("");
    setMessage("");
    try {
      setLoading(true);
      const result = await bookingApi.cancel(booking.bookingId);
      setBooking(result);
      setMessage("Booking cancelled successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-shell py-16">
      <SectionTitle
        eyebrow="Booking desk"
        title="Manage Your Reservation"
        description="Search by booking ID, review reservation details, update requests, or cancel the booking."
      />

      <form onSubmit={searchBooking} className="mx-auto flex max-w-3xl flex-col gap-3 bg-charcoal p-5 luxury-border sm:flex-row">
        <input
          className="field"
          placeholder="Enter Booking ID, e.g. BHB-DEMO2026"
          value={bookingId}
          onChange={(event) => setBookingId(event.target.value.toUpperCase())}
        />
        <LoadingButton loading={loading} type="submit" className="sm:w-48">
          <Search size={18} /> Search
        </LoadingButton>
      </form>

      {(error || message) && (
        <div className={`mx-auto mt-5 max-w-3xl border p-4 text-sm ${error ? "border-red-400/40 bg-red-500/10 text-red-100" : "border-champagne/40 bg-champagne/10 text-champagne"}`}>
          {error || message}
        </div>
      )}

      {booking && (
        <div className="mx-auto mt-8 max-w-4xl bg-charcoal p-6 luxury-border">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row">
            <div>
              <p className="label">Booking ID</p>
              <h2 className="font-display text-3xl text-champagne">{booking.bookingId}</h2>
            </div>
            <span className="self-start bg-champagne px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-midnight">
              {booking.bookingStatus}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Guest", booking.customerName],
              ["Email", booking.email],
              ["Phone", booking.phone],
              ["Room", booking.roomType],
              ["Guests", booking.guests],
              ["Dates", `${booking.checkInDate} to ${booking.checkOutDate}`],
              ["Bed Preference", booking.bedPreference],
              ["Airport Pickup", booking.airportPickup ? "Yes" : "No"]
            ].map(([label, value]) => (
              <div key={label} className="border border-white/10 p-4">
                <p className="label">{label}</p>
                <p className="text-sm text-ivory/78">{value}</p>
              </div>
            ))}
          </div>

          <label className="mt-6 block">
            <span className="label">Update Special Requests</span>
            <textarea
              className="field min-h-32"
              value={specialRequests}
              onChange={(event) => setSpecialRequests(event.target.value)}
            />
          </label>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <LoadingButton loading={loading} type="button" onClick={updateRequests}>
              Save Requests
            </LoadingButton>
            <button type="button" className="btn-secondary border-red-300/40 text-red-100 hover:bg-red-500 hover:text-white" onClick={cancelBooking}>
              <Trash2 size={18} /> Cancel Booking
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
