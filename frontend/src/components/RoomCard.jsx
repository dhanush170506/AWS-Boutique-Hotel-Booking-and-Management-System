import React from 'react';
import { Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function RoomCard({ room }) {
  return (
    <article className="group overflow-hidden bg-charcoal luxury-border transition duration-300 hover:-translate-y-1 hover:shadow-gold">
      <div className="relative h-64 overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <span
          className={`absolute right-4 top-4 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
            room.available ? "bg-champagne text-midnight" : "bg-midnight text-ivory"
          }`}
        >
          {room.available ? "Available" : "Booked"}
        </span>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl text-ivory">{room.name}</h3>
          <p className="text-right text-sm font-bold text-champagne">
            Rs. {room.price.toLocaleString("en-IN")}
            <span className="block text-xs font-medium text-ivory/55">per night</span>
          </p>
        </div>
        <p className="mt-4 text-sm leading-7 text-ivory/68">{room.description}</p>
        <p className="mt-4 flex items-center gap-2 text-sm text-ivory/75">
          <Users size={17} className="text-champagne" /> Up to {room.capacity} guests
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {room.amenities.map((item) => (
            <span key={item} className="border border-white/10 px-3 py-1 text-xs text-ivory/65">
              {item}
            </span>
          ))}
        </div>
        <Link
          to={`/booking?room=${encodeURIComponent(room.name)}`}
          className={`mt-6 w-full ${room.available ? "btn-primary" : "btn-secondary opacity-60"}`}
          aria-disabled={!room.available}
        >
          Book Now
        </Link>
      </div>
    </article>
  );
}
