import React from 'react';
import { Users, Sparkles } from "lucide-react";

function getAvailabilityLabel(room) {
  const totalRooms = Number(room?.totalRooms || 1);
  const availableRooms = Number(room?.availableRooms || totalRooms);
  if (availableRooms <= 0) return 'Booked Out';
  return `${availableRooms}/${totalRooms}`;
}

export default function RoomCard({ room, onSelect }) {
  const imageUrl = room.imageUrls?.[0] || room.image || room.images?.[0] || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";
  const available = Number(room.availableRooms || 0) > 0;

  return (
    <article className="group overflow-hidden bg-charcoal luxury-border transition duration-300 hover:-translate-y-1 hover:shadow-gold">
      <div className="relative h-64 overflow-hidden">
        <img src={imageUrl} alt={room.roomName || room.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <span className={`absolute right-4 top-4 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${available ? "bg-emerald-500/90 text-white" : "bg-rose-600/90 text-white"}`}>
          {available ? "Available" : "Booked Out"}
        </span>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl text-ivory">{room.roomName || room.name}</h3>
            <p className="mt-1 text-sm uppercase tracking-[0.18em] text-champagne">{room.roomType}</p>
          </div>
          <p className="text-right text-sm font-bold text-champagne">
            ₹{Number(room.price || 0).toLocaleString("en-IN")}
            <span className="block text-xs font-medium text-ivory/55">per night</span>
          </p>
        </div>
        <p className="mt-4 text-sm leading-7 text-ivory/68">{room.description}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-ivory/75">
          <span className="flex items-center gap-2"><Users size={16} className="text-champagne" /> {getAvailabilityLabel(room)} available</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {(room.facilities || room.amenities || []).slice(0, 4).map((item) => (
            <span key={item} className="border border-white/10 px-3 py-1 text-xs text-ivory/65">{item}</span>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-midnight/70 p-4 text-sm text-ivory/75">
          <div className="flex items-center justify-between">
            <span>Availability</span>
            <span className="font-semibold text-champagne">{getAvailabilityLabel(room)}</span>
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ivory/60">{room.status || (available ? "Available" : "Booked Out")}</p>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={() => onSelect(room)}>
            <Sparkles size={16} className="mr-2 inline" /> View Details
          </button>
          <button type="button" className={`flex-1 ${available ? "btn-primary" : "btn-secondary opacity-60"}`} disabled={!available} onClick={() => window.location.assign(`/booking?room=${encodeURIComponent(room.roomName || room.name)}`)}>
            Book Now
          </button>
        </div>
      </div>
    </article>
  );
}
