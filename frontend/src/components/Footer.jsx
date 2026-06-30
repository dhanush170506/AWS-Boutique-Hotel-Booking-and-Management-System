import React from 'react';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-charcoal">
      <div className="page-shell grid gap-10 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <h2 className="font-display text-3xl text-champagne">Aurelia Boutique Hotel</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-ivory/68">
            A premium AWS-ready hotel booking and management experience built for luxury stays,
            seamless reservations, and cloud-scale operations.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-champagne">Contact</h3>
          <div className="mt-4 space-y-3 text-sm text-ivory/72">
            <p className="flex gap-3"><MapPin size={18} /> Marine Drive, Mumbai, India</p>
            <p className="flex gap-3"><Phone size={18} /> +91 22 4000 8899</p>
            <p className="flex gap-3"><Mail size={18} /> reservations@aureliahotel.com</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-champagne">Explore</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-ivory/72">
            <Link to="/rooms" className="hover:text-champagne">Rooms</Link>
            <Link to="/booking" className="hover:text-champagne">Booking</Link>
            <Link to="/manage" className="hover:text-champagne">Manage</Link>
            <Link to="/contact" className="hover:text-champagne">Contact</Link>
          </div>
          <div className="mt-6 flex gap-3">
            {[Instagram, Facebook, Twitter].map((Icon, index) => (
              <span
                key={index}
                className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-champagne"
              >
                <Icon size={18} />
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs uppercase tracking-[0.18em] text-ivory/45">
        Cloud-ready architecture for EC2, DynamoDB, S3, Lambda, SNS and SES
      </div>
    </footer>
  );
}
