import React, { useEffect, useMemo, useState } from 'react';
import { Search, X } from "lucide-react";
import RoomCard from "../components/RoomCard";
import SectionTitle from "../components/SectionTitle";
import { roomApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

function getAvailabilityLabel(room) {
  const totalRooms = Number(room?.totalRooms || 1);
  const availableRooms = Number(room?.availableRooms ?? totalRooms);
  if (availableRooms <= 0) return 'Booked Out';
  return `${availableRooms}/${totalRooms}`;
}

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [query, setQuery] = useState("");
  const [capacity, setCapacity] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    roomApi.list().then(setRooms).catch(() => setError("Unable to load rooms."));
  }, []);

  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "Admin";

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const searchText = `${room.roomName || room.name} ${room.description} ${(room.facilities || room.amenities || []).join(" ")}`.toLowerCase();
      const matchesText = searchText.includes(query.toLowerCase());
      const maxGuests = Number(room.maxGuests || room.capacity || 2);
      const matchesCapacity = capacity === "all" || maxGuests >= Number(capacity);
      const available = Number(room.availableRooms || 0) > 0;
      const matchesAvailability = availability === "all" || (availability === "available" ? available : !available);
      return matchesText && matchesCapacity && matchesAvailability;
    });
  }, [rooms, query, capacity, availability]);

  return (
    <section className="page-shell py-16">
      <SectionTitle
        eyebrow="Rooms and suites"
        title="Choose Your Signature Stay"
        description="Browse curated suites, check live availability, and reserve the perfect room for your visit."
      />

      <div className="mb-8 grid gap-4 bg-charcoal p-5 luxury-border md:grid-cols-[1fr_180px_180px]">
        <label className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-champagne" size={18} />
          <input className="field pl-12" placeholder="Search rooms, facilities, or room type" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <select className="field" value={capacity} onChange={(event) => setCapacity(event.target.value)}>
          <option value="all">Any capacity</option>
          <option value="2">2+ guests</option>
          <option value="3">3+ guests</option>
          <option value="4">4+ guests</option>
        </select>
        <select className="field" value={availability} onChange={(event) => setAvailability(event.target.value)}>
          <option value="all">All rooms</option>
          <option value="available">Available</option>
          <option value="booked">Booked out</option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredRooms.map((room) => (
          <RoomCard key={room.roomId} room={room} onSelect={setSelectedRoom} isAdmin={isAdmin} />
        ))}
      </div>

      {error && <div className="mt-8 border border-red-400/40 bg-red-500/10 p-10 text-center text-red-100">{error}</div>}
      {!filteredRooms.length && !error && <div className="mt-8 border border-white/10 p-10 text-center text-ivory/70">No rooms match the selected filters.</div>}

      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/85 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/10 bg-charcoal p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-champagne">Room details</p>
                <h2 className="mt-2 font-display text-3xl text-ivory">{selectedRoom.roomName || selectedRoom.name}</h2>
              </div>
              <button type="button" className="rounded-full border border-white/10 p-2 text-ivory/70" onClick={() => setSelectedRoom(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-3 sm:grid-cols-2">
                {(selectedRoom.imageUrls || [selectedRoom.image || selectedRoom.images?.[0]]).filter(Boolean).map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt={selectedRoom.roomName || selectedRoom.name} className="h-48 w-full rounded-2xl object-cover" />
                ))}
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-midnight/70 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-[0.18em] text-champagne">{selectedRoom.roomType}</p>
                    <p className="text-xl font-semibold text-champagne">₹{Number(selectedRoom.price || 0).toLocaleString("en-IN")}</p>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-ivory/75">{selectedRoom.description}</p>
                  <div className="mt-4 grid gap-3 text-sm text-ivory/75">
                    <div>Available Rooms: {getAvailabilityLabel(selectedRoom)}</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-midnight/70 p-5">
                  <h3 className="text-lg font-semibold text-champagne">Facilities</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(selectedRoom.facilities || selectedRoom.amenities || []).map((facility) => (
                      <span key={facility} className="rounded-full border border-white/10 px-3 py-1 text-xs text-ivory/70">{facility}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-midnight/70 p-5">
                  <h3 className="text-lg font-semibold text-champagne">Cancellation Policy</h3>
                  <p className="mt-2 text-sm leading-7 text-ivory/75">Free cancellation up to 48 hours before arrival. A fee may apply for late cancellations.</p>
                </div>
                {!isAdmin && (
                  <button type="button" className={`w-full ${Number(selectedRoom.availableRooms || 0) > 0 ? "btn-primary" : "btn-secondary opacity-60"}`} disabled={Number(selectedRoom.availableRooms || 0) <= 0} onClick={() => window.location.assign(`/booking?room=${encodeURIComponent(selectedRoom.roomName || selectedRoom.name)}`)}>
                    {Number(selectedRoom.availableRooms || 0) > 0 ? "Reserve This Room" : "Booked Out"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}