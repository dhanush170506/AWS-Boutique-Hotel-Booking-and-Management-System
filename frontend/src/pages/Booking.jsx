import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingButton from "../components/LoadingButton";
import SectionTitle from "../components/SectionTitle";
import { rooms } from "../assets/rooms";
import { bookingApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  customerName: "",
  email: "",
  phone: "",
  checkInDate: "",
  checkOutDate: "",
  guests: "1",
  roomType: "Deluxe Room",
  bedPreference: "King Bed",
  airportPickup: false,
  specialRequests: ""
};

export default function Booking() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const selectedRoom = params.get("room");
  const [form, setForm] = useState({
    ...initialForm,
    customerName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    roomType: selectedRoom || "Deluxe Room",
    bedPreference: user?.preferences?.bedPreference || "King Bed",
    airportPickup: Boolean(user?.preferences?.airportPickup)
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const roomOptions = useMemo(() => rooms.filter((room) => room.available), []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.customerName.trim()) nextErrors.customerName = "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Valid email is required.";
    if (!form.phone.trim()) nextErrors.phone = "Phone number is required.";
    if (!form.checkInDate) nextErrors.checkInDate = "Check-in date is required.";
    if (!form.checkOutDate) nextErrors.checkOutDate = "Check-out date is required.";
    if (Number(form.guests) < 1) nextErrors.guests = "At least one guest is required.";
    if (form.checkInDate && form.checkOutDate && new Date(form.checkOutDate) <= new Date(form.checkInDate)) {
      nextErrors.checkOutDate = "Check-out must be after check-in.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const booking = await bookingApi.create({ ...form, userId: user.id });
      navigate("/confirmation", { state: { booking } });
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-shell py-16">
      <SectionTitle
        eyebrow="Reservations"
        title="Book Your Boutique Stay"
        description="Complete the reservation request and receive a unique booking ID instantly."
      />

      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl bg-charcoal p-6 luxury-border md:p-8">
        {apiError && <div className="mb-6 border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">{apiError}</div>}
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Full Name" error={errors.customerName}>
            <input className="field" value={form.customerName} onChange={(e) => updateField("customerName", e.target.value)} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input className="field" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
          </Field>
          <Field label="Phone Number" error={errors.phone}>
            <input className="field" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </Field>
          <Field label="Number of Guests" error={errors.guests}>
            <input className="field" type="number" min="1" value={form.guests} onChange={(e) => updateField("guests", e.target.value)} />
          </Field>
          <Field label="Check-in Date" error={errors.checkInDate}>
            <input className="field" type="date" value={form.checkInDate} onChange={(e) => updateField("checkInDate", e.target.value)} />
          </Field>
          <Field label="Check-out Date" error={errors.checkOutDate}>
            <input className="field" type="date" value={form.checkOutDate} onChange={(e) => updateField("checkOutDate", e.target.value)} />
          </Field>
          <Field label="Room Type">
            <select className="field" value={form.roomType} onChange={(e) => updateField("roomType", e.target.value)}>
              {roomOptions.map((room) => (
                <option key={room.name} value={room.name}>{room.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Bed Preference">
            <select className="field" value={form.bedPreference} onChange={(e) => updateField("bedPreference", e.target.value)}>
              <option>King Bed</option>
              <option>Queen Bed</option>
              <option>Twin Beds</option>
              <option>Extra Bed</option>
            </select>
          </Field>
          <label className="flex items-center gap-3 border border-white/10 p-4 text-sm text-ivory/78 md:col-span-2">
            <input
              type="checkbox"
              checked={form.airportPickup}
              onChange={(e) => updateField("airportPickup", e.target.checked)}
              className="h-5 w-5 accent-champagne"
            />
            Add private airport pickup
          </label>
          <Field label="Special Requests" className="md:col-span-2">
            <textarea
              className="field min-h-32"
              value={form.specialRequests}
              onChange={(e) => updateField("specialRequests", e.target.value)}
              placeholder="Dietary preferences, celebration setup, arrival time..."
            />
          </Field>
        </div>
        <LoadingButton loading={loading} type="submit" className="mt-7 w-full md:w-auto">
          Confirm Booking
        </LoadingButton>
      </form>
    </section>
  );
}

function Field({ label, error, children, className = "" }) {
  return (
    <label className={className}>
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-2 block text-sm text-red-200">{error}</span>}
    </label>
  );
}
