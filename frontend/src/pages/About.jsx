import React from 'react';
import SectionTitle from "../components/SectionTitle";

const gallery = [
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=900&q=85"
];

export default function About() {
  return (
    <section className="py-16">
      <div className="page-shell">
        <SectionTitle
          eyebrow="Our story"
          title="A Boutique Stay With Grand-Hotel Discipline"
          description="Aurelia blends intimate luxury with cloud-ready operations, making it ideal for a university AWS presentation and a real hotel management workflow."
        />
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="bg-charcoal p-7 luxury-border">
            <h2 className="font-display text-3xl text-champagne">Hotel Story</h2>
            <p className="mt-4 leading-8 text-ivory/72">
              Inspired by coastal Indian hospitality and European boutique design, Aurelia is built
              around thoughtful arrivals, crafted rooms, and a reservation experience that feels as
              premium as the stay itself.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {["Best Boutique Concept", "Luxury Travel Choice", "Cloud Innovation Demo"].map((award) => (
                <div key={award} className="border border-white/10 p-4">
                  <p className="text-sm font-bold text-champagne">{award}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ivory/52">2026 Award</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-ivory p-7 text-midnight">
            <h2 className="font-display text-3xl">Luxury Facilities</h2>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-midnight/70">
              <li>Private airport concierge with arrival coordination.</li>
              <li>Wellness spa, infinity pool, and chef-led dining experiences.</li>
              <li>Executive salons for university, corporate, and celebration events.</li>
              <li>AWS-ready backend modules prepared for DynamoDB, S3, Lambda, SNS and SES.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="page-shell mt-12">
        <div className="grid gap-4 md:grid-cols-4">
          {gallery.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`Aurelia gallery ${index + 1}`}
              className="h-72 w-full object-cover luxury-border"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
