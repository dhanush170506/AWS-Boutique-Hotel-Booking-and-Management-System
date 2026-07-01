import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import LoadingButton from "../components/LoadingButton";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const destination = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : "/dashboard";

  if (isAuthenticated) return <Navigate to="/" replace />;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const user = await login(form);
      const normalizedRole = String(user?.role || "").trim().toLowerCase();
      const redirect = normalizedRole === "admin" ? "/admin/dashboard" : destination;
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-shell py-16">
      <SectionTitle eyebrow="Guest access" title="Login" description="Access bookings, profile preferences, and reservation tools." />
      <form onSubmit={handleSubmit} className="mx-auto max-w-xl bg-charcoal p-6 luxury-border md:p-8">
        {error && <div className="mb-5 border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>}
        <label className="block">
          <span className="label">Email</span>
          <input className="field" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
        </label>
        <label className="mt-5 block">
          <span className="label">Password</span>
          <input className="field" type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} />
        </label>
        <LoadingButton loading={loading} type="submit" className="mt-7 w-full">
          Login
        </LoadingButton>
        <p className="mt-5 text-center text-sm text-ivory/65">
          New guest? <Link to="/register" className="font-bold text-champagne">Create an account</Link>
        </p>
      </form>
    </section>
  );
}
