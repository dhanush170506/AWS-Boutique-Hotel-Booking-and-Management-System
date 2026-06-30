import React from 'react';
import { ArrowRight, ConciergeBell, Sparkles, Star, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import SectionTitle from "../components/SectionTitle";
import { amenities, rooms } from "../assets/rooms";

const testimonials = [
  {
    name: "Nisha Kapoor",
    text: "The suite, service, and restaurant felt flawlessly curated. A beautiful presentation project and a genuinely polished hotel experience.",
    rating: 5
  },
  {
    name: "Rahul Menon",
    text: "Booking was quick, the confirmation was instant, and the management tools made the workflow feel enterprise-ready.",
    rating: 5
  },
  {
    name: "Sara Thomas",
    text: "Elegant, fast, and premium. The cloud-ready structure is very clear without making the UI feel technical.",
    rating: 5
  }
];

export default function Home() {
  return (
    <>
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=85"
          alt="Luxury hotel lobby"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/72 to-midnight/20" />
        <div className="page-shell relative flex min-h-[calc(100vh-5rem)] items-center py-20">
          <div className="max-w-3xl fade-up">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-champagne">
              Luxury cloud hospitality
            </p>
            <h1 className="mt-5 font-display text-5xl font-bold leading-tight text-ivory md:text-7xl">
              Aurelia Boutique Hotel
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ivory/78">
              Reserve premium suites, manage bookings, and demonstrate a polished AWS-ready hotel
              platform built for modern cloud deployment.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link to="/booking" className="btn-primary">
                Book Your Stay <ArrowRight size={18} />
              </Link>
              <Link to="/rooms" className="btn-secondary">
                Explore Rooms
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-20">
        <SectionTitle
          eyebrow="Signature stays"
          title="Featured Rooms"
          description="A curated selection of suites with rich textures, elevated amenities, and seamless booking."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {rooms.slice(0, 3).map((room) => (
            <RoomCard key={room.name} room={room} />
          ))}
        </div>
      </section>

      <section className="bg-ivory py-20 text-midnight">
        <div className="page-shell">
          <SectionTitle
            eyebrow="Amenities"
            title="Every Detail Considered"
            description="From private concierge support to wellness-led experiences, Aurelia is designed for memorable premium stays."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {amenities.map((item, index) => {
              const icons = [ConciergeBell, Sparkles, Utensils];
              const Icon = icons[index % icons.length];
              return (
                <div key={item} className="border border-midnight/10 bg-white p-6 transition hover:-translate-y-1">
                  <Icon className="text-antique" />
                  <h3 className="mt-5 text-lg font-bold">{item}</h3>
                  <p className="mt-3 text-sm leading-7 text-midnight/62">
                    Premium service standards with reliable operations behind each guest touchpoint.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-shell py-20">
        <SectionTitle eyebrow="Guest voices" title="Testimonials" />
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="bg-charcoal p-7 luxury-border">
              <div className="flex gap-1 text-champagne">
                {Array.from({ length: item.rating }).map((_, index) => (
                  <Star key={index} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-ivory/72">“{item.text}”</p>
              <h3 className="mt-6 font-bold text-champagne">{item.name}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell pb-20">
        <div className="relative overflow-hidden p-8 luxury-border md:p-12">
          <img
            src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=85"
            alt="Hotel exterior"
            className="absolute inset-0 h-full w-full object-cover opacity-28"
          />
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-champagne">
              Ready for arrival
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
              Secure your stay in minutes.
            </h2>
            <p className="mt-4 text-ivory/72">
              Create bookings, receive a unique ID, and manage reservation requests from one elegant
              interface.
            </p>
            <Link to="/booking" className="btn-primary mt-8">
              Start Booking
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
