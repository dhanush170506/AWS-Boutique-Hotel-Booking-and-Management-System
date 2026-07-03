import React, { useState } from 'react';
import { Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const guestLinks = [
  ["Home", "/"],
  ["Rooms", "/rooms"],
  ["About", "/about"],
  ["Contact", "/contact"]
];

const userLinks = [
  ["Home", "/"],
  ["Rooms", "/rooms"],
  ["Dashboard", "/dashboard"],
  ["My Bookings", "/my-bookings"]
];

const adminLinks = [
  ["Home", "/"],
  ["Rooms", "/rooms"],
  ["Dashboard", "/admin/dashboard"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const links = isAuthenticated
    ? user?.role === "Admin"
      ? adminLinks
      : userLinks
    : guestLinks;

  function handleLogout() {
    logout();
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-midnight/85 backdrop-blur-xl">
      <nav className="page-shell flex h-20 items-center justify-between">
        <Link to="/" className="font-display text-2xl font-bold tracking-wide text-champagne">
          Aurelia
          <span className="block text-[10px] font-sans font-bold uppercase tracking-[0.32em] text-ivory/70">
            Boutique Hotel
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `text-sm font-semibold uppercase tracking-[0.16em] transition ${
                  isActive ? "text-champagne" : "text-ivory/72 hover:text-champagne"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="btn-secondary">
                Profile
              </Link>
              <button type="button" onClick={handleLogout} className="btn-primary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          className="inline-flex h-11 w-11 items-center justify-center border border-white/15 lg:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-charcoal lg:hidden">
          <div className="page-shell flex flex-col py-4">
            {links.map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className="border-b border-white/8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-ivory/80"
              >
                {label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="border-b border-white/8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-ivory/80"
                >
                  Profile
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-4 text-left text-sm font-bold uppercase tracking-[0.16em] text-ivory/80"
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <div className="grid gap-3 pt-4">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
