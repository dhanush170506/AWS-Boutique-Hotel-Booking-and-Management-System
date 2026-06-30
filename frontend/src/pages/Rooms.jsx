import React, { useMemo, useState } from 'react';
import { Search } from "lucide-react";
import RoomCard from "../components/RoomCard";
import SectionTitle from "../components/SectionTitle";
import { rooms } from "../assets/rooms";

export default function Rooms() {
  const [query, setQuery] = useState("");
  const [capacity, setCapacity] = useState("all");
  const [availability, setAvailability] = useState("all");

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesText = `${room.name} ${room.description} ${room.amenities.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCapacity = capacity === "all" || room.capacity >= Number(capacity);
      const matchesAvailability =
        availability === "all" ||
        (availability === "available" ? room.available : !room.available);
      return matchesText && matchesCapacity && matchesAvailability;
    });
  }, [query, capacity, availability]);

  return (
    <section className="page-shell py-16">
      <SectionTitle
        eyebrow="Rooms and suites"
        title="Choose Your Signature Stay"
        description="Search by room style, filter by availability, and select the suite that matches your guest count."
      />

      <div className="mb-8 grid gap-4 bg-charcoal p-5 luxury-border md:grid-cols-[1fr_180px_180px]">
        <label className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-champagne" size={18} />
          <input
            className="field pl-12"
            placeholder="Search rooms, amenities, views..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select className="field" value={capacity} onChange={(event) => setCapacity(event.target.value)}>
          <option value="all">Any capacity</option>
          <option value="2">2+ guests</option>
          <option value="3">3+ guests</option>
          <option value="4">4+ guests</option>
        </select>
        <select
          className="field"
          value={availability}
          onChange={(event) => setAvailability(event.target.value)}
        >
          <option value="all">All rooms</option>
          <option value="available">Available</option>
          <option value="booked">Booked</option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredRooms.map((room) => (
          <RoomCard key={room.name} room={room} />
        ))}
      </div>

      {!filteredRooms.length && (
        <div className="mt-8 border border-white/10 p-10 text-center text-ivory/70">
          No rooms match the selected filters.
        </div>
      )}
    </section>
  );
}
