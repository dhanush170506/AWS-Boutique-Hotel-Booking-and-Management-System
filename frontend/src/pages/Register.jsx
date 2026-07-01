import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from "react-router-dom";
import LoadingButton from "../components/LoadingButton";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "user",
};

export default function Register() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setApiError("");
  }

  function validate() {
    const nextErrors = {};
    Object.entries(form).forEach(([field, value]) => {
      if (!value.trim()) nextErrors[field] = "Required.";
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Enter a valid email.";
    if (form.password && form.password.length < 6) nextErrors.password = "Minimum 6 characters.";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords must match.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const user = await register(form);
      const normalizedRole = String(user?.role || "").trim().toLowerCase();
      const redirect = normalizedRole === "admin" ? "/admin/dashboard" : "/dashboard";
      navigate(redirect, { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.message || "Unable to register.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-shell py-16">
      <SectionTitle eyebrow="New guest" title="Register" description="Create an account to reserve rooms and manage your stays." />
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl bg-charcoal p-6 luxury-border md:p-8">
        {apiError && <div className="mb-5 border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">{apiError}</div>}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <span className="label">Register as</span>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { value: 'user', label: 'User', description: 'Reserve rooms and manage your stay.' },
                { value: 'admin', label: 'Admin', description: 'Manage rooms, users, bookings and analytics.' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-3xl border p-5 transition ${
                    form.role === option.value
                      ? 'border-champagne bg-champagne/10'
                      : 'border-white/10 bg-midnight'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={form.role === option.value}
                    onChange={() => updateField('role', option.value)}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ivory">{option.label}</p>
                      <p className="mt-2 text-sm text-ivory/60">{option.description}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-ivory/70">
                      {form.role === option.value ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <Field label="Full Name" error={errors.fullName}>
            <input className="field" value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input className="field" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
          </Field>
          <Field label="Phone Number" error={errors.phone}>
            <input className="field" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </Field>
          <Field label="Password" error={errors.password}>
            <input className="field" type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} />
          </Field>
          <Field label="Confirm Password" error={errors.confirmPassword} className="md:col-span-2">
            <input className="field" type="password" value={form.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} />
          </Field>
        </div>
        <LoadingButton loading={loading} type="submit" className="mt-7 w-full md:w-auto">
          Register
        </LoadingButton>
        <p className="mt-5 text-sm text-ivory/65">
          Already registered? <Link to="/login" className="font-bold text-champagne">Login</Link>
        </p>
      </form>
    </section>
  );
}

function Field({ label, error, children, className = "" }) {
  return (
    <label className={className}>
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-2 block text-sm text-red-200">{error}</span>}
    </label>
  );
}
