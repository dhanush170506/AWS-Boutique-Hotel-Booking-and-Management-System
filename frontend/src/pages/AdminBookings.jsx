import React, { useEffect, useState } from 'react';
import SectionTitle from '../components/SectionTitle';
import { adminApi } from '../services/api';
import LoadingButton from '../components/LoadingButton';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.listBookings().then(setBookings).catch(() => setError('Unable to load bookings.'));
  }, []);

  const filtered = bookings.filter((booking) => {
    const normalized = `${booking.bookingId} ${booking.customerName} ${booking.email} ${booking.roomType} ${booking.bookingStatus}`.toLowerCase();
    return normalized.includes(query.toLowerCase());
  });

  async function cancelBooking(bookingId) {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      const updated = await adminApi.cancelBooking(bookingId);
      setBookings((current) => current.map((booking) => (booking.bookingId === bookingId ? updated : booking)));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel booking.');
    }
  }

  async function deleteBooking(bookingId) {
    if (!window.confirm('Delete this booking permanently? This cannot be undone.')) return;
    try {
      await adminApi.deleteBooking(bookingId, true);
      setBookings((current) => current.filter((booking) => booking.bookingId !== bookingId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete booking.');
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-charcoal p-8">
      <SectionTitle eyebrow="Booking management" title="Manage Hotel Reservations" description="Review bookings, cancel stays, and remove completed reservations." />
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="field max-w-md"
          placeholder="Search bookings by customer, email, room or status"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <p className="text-sm text-ivory/60">{filtered.length} bookings found</p>
      </div>

      {error && <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>}

      <div className="relative mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-charcoal">
            <tr className="border-b border-white/10 text-ivory/70">
              <th className="py-4 pr-4 whitespace-nowrap">Booking ID</th>
              <th className="py-4 pr-4 whitespace-nowrap">Customer</th>
              <th className="py-4 pr-4 whitespace-nowrap">Email</th>
              <th className="py-4 pr-4 whitespace-nowrap">Room</th>
              <th className="py-4 pr-4 whitespace-nowrap">Room Price/Night</th>
              <th className="py-4 pr-4 whitespace-nowrap">Total Nights</th>
              <th className="py-4 pr-4 whitespace-nowrap">Total Price</th>
              <th className="py-4 pr-4 whitespace-nowrap">Check-In</th>
              <th className="py-4 pr-4 whitespace-nowrap">Check-Out</th>
              <th className="py-4 pr-4 whitespace-nowrap">Status</th>
              <th className="py-4 pr-4 whitespace-nowrap">Payment</th>
              <th className="py-4 pr-4 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((booking) => {
              const checkIn = new Date(booking.checkInDate);
              const checkOut = new Date(booking.checkOutDate);
              const totalNights = checkIn && checkOut ? Math.max(0, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) : 0;
              const roomPrice = Number(booking.roomPrice || 0);
              const totalPrice = roomPrice * totalNights;
              return (
                <tr key={booking.bookingId} className="border-b border-white/10">
                  <td className="py-4 pr-4 whitespace-nowrap">{booking.bookingId}</td>
                  <td className="py-4 pr-4 whitespace-nowrap">{booking.customerName}</td>
                  <td className="py-4 pr-4 whitespace-nowrap">{booking.email}</td>
                  <td className="py-4 pr-4 whitespace-nowrap">{booking.roomType}</td>
                  <td className="py-4 pr-4 whitespace-nowrap">₹{roomPrice.toLocaleString('en-IN')}</td>
                  <td className="py-4 pr-4 whitespace-nowrap">{totalNights}</td>
                  <td className="py-4 pr-4 whitespace-nowrap">₹{totalPrice.toLocaleString('en-IN')}</td>
                  <td className="py-4 pr-4 whitespace-nowrap">{checkIn.toLocaleDateString()}</td>
                  <td className="py-4 pr-4 whitespace-nowrap">{checkOut.toLocaleDateString()}</td>
                  <td className="py-4 pr-4 whitespace-nowrap uppercase tracking-[0.14em] text-champagne">{booking.bookingStatus}</td>
                  <td className="py-4 pr-4 whitespace-nowrap uppercase tracking-[0.14em] text-ivory/70">{booking.paymentStatus || 'Pending'}</td>
                  <td className="py-4 pr-4 whitespace-nowrap space-x-2">
                    <button className="btn-secondary" onClick={() => cancelBooking(booking.bookingId)}>Cancel</button>
                    <button className="btn-secondary border-red-400/25 text-red-100 hover:bg-red-500" onClick={() => deleteBooking(booking.bookingId)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
