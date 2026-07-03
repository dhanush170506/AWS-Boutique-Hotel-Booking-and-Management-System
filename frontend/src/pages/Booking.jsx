import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingButton from "../components/LoadingButton";
import SectionTitle from "../components/SectionTitle";
import { bookingApi, roomApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  customerName: "",
  email: "",
  phone: "",
  checkInDate: "",
  checkOutDate: "",
  guests: "1",
  roomType: "",
  bedPreference: "King Bed",
  airportPickup: false,
  specialRequests: ""
};

export default function Booking() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const selectedRoomParam = params.get("room");
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    ...initialForm,
    customerName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    roomId: "",
    roomType: selectedRoomParam || "",
    roomPrice: 0,
    bedPreference: user?.preferences?.bedPreference || "King Bed",
    airportPickup: Boolean(user?.preferences?.airportPickup)
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    roomApi.list().then((result) => {
      setRooms(result);
      const availableRooms = result.filter((room) => Number(room.availableRooms || 0) > 0);
      if (availableRooms.length) {
        const firstRoom = availableRooms.find((room) => (selectedRoomParam ? (room.roomName || room.name) === selectedRoomParam : true)) || availableRooms[0];
        setForm((current) => ({
          ...current,
          roomId: current.roomId || firstRoom?.roomId || "",
          roomType: current.roomType || firstRoom?.roomName || firstRoom?.name || "",
          roomPrice: current.roomPrice || firstRoom?.price || 0,
        }));
      }
    }).catch(() => setApiError("Unable to load available rooms."));
  }, [selectedRoomParam]);

  const roomOptions = useMemo(() => rooms.filter((room) => Number(room.availableRooms || 0) > 0), [rooms]);
  const selectedRoom = useMemo(() => roomOptions.find((room) => room.roomId === form.roomId) || roomOptions.find((room) => (room.roomName || room.name) === form.roomType) || null, [form.roomId, form.roomType, roomOptions]);

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
    if (!form.roomId) nextErrors.roomType = "Please select a room.";
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
      <SectionTitle eyebrow="Reservations" title="Book Your Boutique Stay" description="Reserve your preferred suite with flexible dates, guest counts, and a clear booking summary." />

      <div className="mx-auto mb-8 max-w-5xl rounded-[2rem] border border-white/10 bg-charcoal p-6 luxury-border">
        <p className="text-sm uppercase tracking-[0.2em] text-champagne">Booking summary</p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl text-ivory">{selectedRoom ? selectedRoom.roomName || selectedRoom.name : "Choose your room"}</h2>
            <p className="mt-2 text-sm text-ivory/70">{selectedRoom ? `${selectedRoom.roomType} • ${selectedRoom.maxGuests || selectedRoom.capacity || 2} guests max` : "Select an available room to continue."}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-midnight/70 px-4 py-3 text-sm text-ivory/75">
            <div className="font-semibold text-champagne">₹{Number(selectedRoom?.price || form.roomPrice || 0).toLocaleString("en-IN")}</div>
            <div>per night</div>
          </div>
        </div>
      </div>

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
          <Field label="Room Type" error={errors.roomType}>
            <select className="field" value={form.roomType} onChange={(e) => {
              const selected = rooms.find((room) => (room.roomName || room.name) === e.target.value);
              updateField("roomType", e.target.value);
              if (selected) {
                updateField("roomId", selected.roomId);
                updateField("roomPrice", selected.price);
              }
            }}>
              {roomOptions.map((room) => (
                <option key={room.roomId} value={room.roomName || room.name}>{room.roomName || room.name}</option>
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
            <input type="checkbox" checked={form.airportPickup} onChange={(e) => updateField("airportPickup", e.target.checked)} className="h-5 w-5 accent-champagne" />
            Add private airport pickup
          </label>
          <Field label="Special Requests" className="md:col-span-2">
            <textarea className="field min-h-32" value={form.specialRequests} onChange={(e) => updateField("specialRequests", e.target.value)} placeholder="Dietary preferences, celebration setup, arrival time..." />
          </Field>
        </div>
        <LoadingButton loading={loading} type="submit" className="mt-7 w-full md:w-auto">Confirm Booking</LoadingButton>
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
