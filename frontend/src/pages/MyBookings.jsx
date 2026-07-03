import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, XCircle } from "lucide-react";
import LoadingButton from "../components/LoadingButton";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";
import { bookingApi } from "../services/api";

function calculateTotal(booking) {
  const nights = Math.max(1, Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / 86400000));
  return (Number(booking.roomPrice || 0) || 0) * nights;
}

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  async function loadBookings() {
    const result = await bookingApi.listByUser(user.id);
    setBookings(result);
  }

  useEffect(() => {
    loadBookings().catch(() => setError("Unable to load bookings."));
  }, [user.id]);

  const groupedBookings = useMemo(() => {
    const now = new Date();
    const upcoming = bookings.filter((booking) => booking.bookingStatus !== "Cancelled" && new Date(booking.checkInDate) >= now);
    const completed = bookings.filter((booking) => booking.bookingStatus === "Completed" || new Date(booking.checkOutDate) < now);
    const cancelled = bookings.filter((booking) => booking.bookingStatus === "Cancelled");
    return { upcoming, completed, cancelled };
  }, [bookings]);

  function startEdit(booking) {
    if (booking.bookingStatus === "Cancelled") return;
    setEditingBooking({ ...booking, guests: String(booking.guests) });
    setSelectedBooking(null);
    setMessage("");
    setError("");
  }

  function updateEdit(field, value) {
    setEditingBooking((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function validateEdit() {
    if (!editingBooking.checkInDate || !editingBooking.checkOutDate) return "Check-in and check-out dates are required.";
    if (new Date(editingBooking.checkOutDate) <= new Date(editingBooking.checkInDate)) return "Check-out must be after check-in.";
    if (Number(editingBooking.guests) < 1) return "Guests must be at least 1.";
    return null;
  }

  async function saveEdit(event) {
    event.preventDefault();
    const validationError = validateEdit();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const updated = await bookingApi.update(editingBooking.bookingId, {
        userId: user.id,
        checkInDate: editingBooking.checkInDate,
        checkOutDate: editingBooking.checkOutDate,
        guests: editingBooking.guests,
        roomType: editingBooking.roomType,
        specialRequests: editingBooking.specialRequests,
        bedPreference: editingBooking.bedPreference,
        airportPickup: editingBooking.airportPickup
      });
      setBookings((current) => current.map((booking) => (booking.bookingId === updated.bookingId ? updated : booking)));
      setEditingBooking(null);
      setMessage("Booking updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update booking.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(booking) {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      setLoading(true);
      const cancelled = await bookingApi.cancel(booking.bookingId, user.id);
      setBookings((current) => current.map((item) => (item.bookingId === cancelled.bookingId ? cancelled : item)));
      setMessage("Booking cancelled successfully.");
      if (selectedBooking?.bookingId === cancelled.bookingId) setSelectedBooking(cancelled);
      if (editingBooking?.bookingId === cancelled.bookingId) setEditingBooking(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel booking.");
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: "upcoming", label: "Upcoming", items: groupedBookings.upcoming },
    { id: "completed", label: "Completed", items: groupedBookings.completed },
    { id: "cancelled", label: "Cancelled", items: groupedBookings.cancelled },
  ];
  const visibleBookings = tabs.find((tab) => tab.id === activeTab)?.items || [];

  return (
    <section className="page-shell py-16">
      <SectionTitle eyebrow="Reservations" title="My Bookings" description="Track upcoming stays, review completed visits, and manage cancellations from one place." />
      {message && <div className="mb-5 border border-champagne/40 bg-champagne/10 p-4 text-sm text-champagne">{message}</div>}
      {error && <div className="mb-5 border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>}

      <div className="mb-6 flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" className={`rounded-full px-4 py-2 text-sm ${activeTab === tab.id ? "bg-champagne text-midnight" : "bg-charcoal text-ivory/75"}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label} ({tab.items.length})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto bg-charcoal luxury-border">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-champagne">
            <tr>
              {['Booking ID', 'Room', 'Room Number', 'Dates', 'Price', 'Status', 'Actions'].map((heading) => (
                <th key={heading} className="px-4 py-4">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleBookings.map((booking) => (
              <tr key={booking.bookingId} className="border-b border-white/8 text-ivory/75">
                <td className="px-4 py-4 font-bold text-champagne">{booking.bookingId}</td>
                <td className="px-4 py-4">{booking.roomName || booking.roomType}</td>
                <td className="px-4 py-4">{booking.roomNumber || "—"}</td>
                <td className="px-4 py-4">{booking.checkInDate} → {booking.checkOutDate}</td>
                <td className="px-4 py-4">₹{calculateTotal(booking).toLocaleString("en-IN")}</td>
                <td className="px-4 py-4">{booking.bookingStatus}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn-secondary px-3 py-2" onClick={() => setSelectedBooking(booking)}><Eye size={16} /> View</button>
                    <button type="button" className="btn-secondary px-3 py-2" disabled={booking.bookingStatus === "Cancelled"} onClick={() => startEdit(booking)}><Pencil size={16} /> Edit Dates</button>
                    <button type="button" className="btn-secondary border-red-300/40 px-3 py-2 text-red-100 hover:bg-red-500 hover:text-white" disabled={booking.bookingStatus === "Cancelled" || loading} onClick={() => cancelBooking(booking)}><XCircle size={16} /> Cancel</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visibleBookings.length && <div className="p-8 text-center text-ivory/65">No bookings in this section.</div>}
      </div>

      {selectedBooking && (
        <div className="mt-8 bg-charcoal p-6 luxury-border">
          <h2 className="font-display text-3xl text-champagne">Booking Details</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {Object.entries({
              "Booking ID": selectedBooking.bookingId,
              Room: selectedBooking.roomName || selectedBooking.roomType,
              Status: selectedBooking.bookingStatus,
              "Check-in": selectedBooking.checkInDate,
              "Check-out": selectedBooking.checkOutDate,
              Guests: selectedBooking.guests,
              Bed: selectedBooking.bedPreference,
              "Airport Pickup": selectedBooking.airportPickup ? "Yes" : "No",
              "Special Requests": selectedBooking.specialRequests || "None"
            }).map(([label, value]) => (
              <div key={label} className="border border-white/10 p-4">
                <p className="label">{label}</p>
                <p className="text-sm text-ivory/75">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingBooking && (
        <form onSubmit={saveEdit} className="mt-8 bg-charcoal p-6 luxury-border">
          <h2 className="font-display text-3xl text-champagne">Edit Booking</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Check-in Date"><input className="field" type="date" value={editingBooking.checkInDate} onChange={(e) => updateEdit("checkInDate", e.target.value)} /></Field>
            <Field label="Check-out Date"><input className="field" type="date" value={editingBooking.checkOutDate} onChange={(e) => updateEdit("checkOutDate", e.target.value)} /></Field>
            <Field label="Number of Guests"><input className="field" type="number" min="1" value={editingBooking.guests} onChange={(e) => updateEdit("guests", e.target.value)} /></Field>
            <Field label="Room Preference"><select className="field" value={editingBooking.roomType} onChange={(e) => updateEdit("roomType", e.target.value)}><option>{editingBooking.roomType}</option></select></Field>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row"><LoadingButton loading={loading} type="submit">Save Changes</LoadingButton><button type="button" className="btn-secondary" onClick={() => setEditingBooking(null)}>Close</button></div>
        </form>
      )}
    </section>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={className}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
