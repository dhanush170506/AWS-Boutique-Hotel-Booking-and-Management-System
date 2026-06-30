import React, { useState } from 'react';
import LoadingButton from "../components/LoadingButton";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../services/api";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    preferences: {
      bedPreference: user.preferences?.bedPreference || "King Bed",
      smokingPreference: user.preferences?.smokingPreference || "Non-Smoking",
      airportPickup: Boolean(user.preferences?.airportPickup),
      foodPreference: user.preferences?.foodPreference || "Vegetarian"
    }
  });

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  function updatePreference(field, value) {
    setForm((current) => ({
      ...current,
      preferences: { ...current.preferences, [field]: value }
    }));
    setMessage("");
  }

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    if (!form.fullName.trim() || !form.phone.trim()) {
      setError("Full Name and Phone Number are required.");
      return;
    }

    try {
      setLoading(true);
      const updated = await userApi.updateProfile(user.id, {
        fullName: form.fullName,
        phone: form.phone,
        preferences: form.preferences
      });
      setUser(updated);
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-shell py-16">
      <SectionTitle eyebrow="Guest profile" title="Profile" description="Manage your personal details and stay preferences." />
      <form onSubmit={saveProfile} className="mx-auto max-w-5xl bg-charcoal p-6 luxury-border md:p-8">
        {message && <div className="mb-5 border border-champagne/40 bg-champagne/10 p-4 text-sm text-champagne">{message}</div>}
        {error && <div className="mb-5 border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>}

        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row">
          <h2 className="font-display text-3xl text-champagne">Personal Information</h2>
          <button type="button" className="btn-secondary" onClick={() => setEditing((value) => !value)}>
            Edit Profile
          </button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Field label="Full Name">
            <input className="field" disabled={!editing} value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
          </Field>
          <Field label="Email">
            <input className="field" disabled value={form.email} />
          </Field>
          <Field label="Phone Number">
            <input className="field" disabled={!editing} value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </Field>
        </div>

        <h2 className="mt-10 font-display text-3xl text-champagne">Preferences</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Bed Preference">
            <select className="field" disabled={!editing} value={form.preferences.bedPreference} onChange={(e) => updatePreference("bedPreference", e.target.value)}>
              <option>King Bed</option>
              <option>Queen Bed</option>
              <option>Twin Beds</option>
              <option>Extra Bed</option>
            </select>
          </Field>
          <Field label="Smoking Preference">
            <select className="field" disabled={!editing} value={form.preferences.smokingPreference} onChange={(e) => updatePreference("smokingPreference", e.target.value)}>
              <option>Non-Smoking</option>
              <option>Smoking</option>
            </select>
          </Field>
          <Field label="Food Preference">
            <select className="field" disabled={!editing} value={form.preferences.foodPreference} onChange={(e) => updatePreference("foodPreference", e.target.value)}>
              <option>Vegetarian</option>
              <option>Non-Vegetarian</option>
              <option>Vegan</option>
              <option>Jain</option>
            </select>
          </Field>
          <label className="flex items-center gap-3 border border-white/10 p-4 text-sm text-ivory/78">
            <input
              type="checkbox"
              disabled={!editing}
              checked={form.preferences.airportPickup}
              onChange={(e) => updatePreference("airportPickup", e.target.checked)}
              className="h-5 w-5 accent-champagne"
            />
            Airport Pickup
          </label>
        </div>

        <LoadingButton loading={loading} type="submit" className="mt-7" disabled={!editing}>
          Save Changes
        </LoadingButton>
      </form>
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
