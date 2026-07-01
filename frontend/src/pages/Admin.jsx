import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, ShieldCheck } from "lucide-react";
import LoadingButton from "../components/LoadingButton";
import SectionTitle from "../components/SectionTitle";
import { roomApi } from "../services/api";

const emptyRoom = {
  name: "",
  price: "",
  capacity: "",
  image: "",
  description: "",
  amenities: "",
  available: true,
};

export default function Admin() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState(emptyRoom);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    refreshRooms();
  }, []);

  async function refreshRooms() {
    try {
      const result = await roomApi.list();
      setRooms(result);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load rooms.");
    }
  }

  function startCreate() {
    setSelectedRoom(null);
    setForm(emptyRoom);
    setMessage("");
    setError("");
  }

  function startEdit(room) {
    setSelectedRoom(room);
    setForm({
      name: room.name,
      price: String(room.price),
      capacity: String(room.capacity),
      image: room.image,
      description: room.description,
      amenities: room.amenities.join(", "),
      available: room.available,
    });
    setMessage("");
    setError("");
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
    setError("");
  }

  const validForm = useMemo(() => {
    return form.name.trim() && Number(form.price) > 0 && Number(form.capacity) > 0;
  }, [form]);

  async function saveRoom(event) {
    event.preventDefault();
    if (!validForm) {
      setError("Name, price, and capacity are required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      capacity: Number(form.capacity),
      image: form.image.trim(),
      description: form.description.trim(),
      amenities: form.amenities.split(",").map((item) => item.trim()).filter(Boolean),
      available: Boolean(form.available),
    };

    try {
      setLoading(true);
      if (selectedRoom) {
        await roomApi.update(selectedRoom.roomId, payload);
        setMessage("Room updated successfully.");
      } else {
        await roomApi.create(payload);
        setMessage("Room created successfully.");
      }
      setSelectedRoom(null);
      setForm(emptyRoom);
      refreshRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save room.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteRoom(roomId) {
    if (!window.confirm("Delete this room permanently?")) return;
    try {
      setLoading(true);
      await roomApi.delete(roomId);
      setMessage("Room deleted successfully.");
      refreshRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete room.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-shell py-16">
      <SectionTitle
        eyebrow="Admin panel"
        title="Manage Rooms"
        description="Create, update, and publish room availability for the boutique hotel catalog."
      />

      {message && <div className="mb-5 border border-champagne/40 bg-champagne/10 p-4 text-sm text-champagne">{message}</div>}
      {error && <div className="mb-5 border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>}

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label">Rooms</p>
          <p className="text-sm text-ivory/70">Manage suites and inventory from the hotel catalog.</p>
        </div>
        <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={startCreate}>
          <Plus size={18} /> New Room
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          {rooms.map((room) => (
            <div key={room.roomId} className="bg-charcoal p-5 luxury-border">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-display text-2xl text-ivory">{room.name}</h3>
                  <p className="text-sm text-ivory/60">Rs. {room.price.toLocaleString("en-IN")} · {room.capacity} guests</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${room.available ? "bg-champagne text-midnight" : "bg-midnight text-ivory"}`}>
                  {room.available ? "Available" : "Unavailable"}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-ivory/72">{room.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {room.amenities?.map((item) => (
                  <span key={item} className="border border-white/10 px-3 py-1 text-xs text-ivory/65">{item}</span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" className="btn-secondary px-3 py-2" onClick={() => startEdit(room)}>
                  <Pencil size={16} /> Edit
                </button>
                <button type="button" className="btn-secondary border-red-300/40 px-3 py-2 text-red-100 hover:bg-red-500 hover:text-white" onClick={() => deleteRoom(room.roomId)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
          {!rooms.length && <div className="border border-white/10 p-8 text-center text-ivory/70">No rooms found.</div>}
        </div>

        <form onSubmit={saveRoom} className="bg-charcoal p-6 luxury-border">
          <div className="flex items-center gap-3 text-champagne">
            <ShieldCheck />
            <h2 className="font-display text-3xl">{selectedRoom ? "Edit Room" : "Create Room"}</h2>
          </div>

          <div className="mt-6 grid gap-5">
            <Field label="Room Name">
              <input className="field" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
            </Field>

            <Field label="Price (INR)">
              <input className="field" type="number" min="0" step="100" value={form.price} onChange={(e) => updateField("price", e.target.value)} />
            </Field>

            <Field label="Capacity">
              <input className="field" type="number" min="1" value={form.capacity} onChange={(e) => updateField("capacity", e.target.value)} />
            </Field>

            <Field label="Image URL">
              <input className="field" type="url" value={form.image} onChange={(e) => updateField("image", e.target.value)} />
            </Field>

            <Field label="Description">
              <textarea className="field min-h-28" value={form.description} onChange={(e) => updateField("description", e.target.value)} />
            </Field>

            <Field label="Amenities (comma separated)">
              <input className="field" value={form.amenities} onChange={(e) => updateField("amenities", e.target.value)} />
            </Field>

            <label className="flex items-center gap-3 border border-white/10 p-4 text-sm text-ivory/78">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => updateField("available", e.target.checked)}
                className="h-5 w-5 accent-champagne"
              />
              Mark room as available
            </label>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <LoadingButton loading={loading} type="submit" className="w-full sm:w-auto">
              {selectedRoom ? "Save Changes" : "Create Room"}
            </LoadingButton>
            {selectedRoom && (
              <button type="button" className="btn-secondary" onClick={startCreate}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
