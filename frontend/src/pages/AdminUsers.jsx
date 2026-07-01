import React, { useEffect, useState } from 'react';
import SectionTitle from '../components/SectionTitle';
import { adminApi } from '../services/api';
import LoadingButton from '../components/LoadingButton';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.listUsers().then(setUsers).catch(() => setError('Unable to load users.'));
  }, []);

  const filtered = users.filter((user) => {
    const normalized = `${user.fullName} ${user.email} ${user.phone} ${user.role}`.toLowerCase();
    return normalized.includes(query.toLowerCase());
  });

  async function saveUser(userId, payload) {
    try {
      setSaving(true);
      const updated = await adminApi.updateUser(userId, payload);
      setUsers((current) => current.map((user) => (user.userId === userId ? updated : user)));
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update user.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers((current) => current.filter((user) => user.userId !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete user.');
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-charcoal p-8">
      <SectionTitle eyebrow="User management" title="Manage Registered Users" description="View, edit, assign roles, and remove users from the hotel system." />
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="field max-w-md"
          placeholder="Search users by name, email or role"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <p className="text-sm text-ivory/60">{filtered.length} users found</p>
      </div>

      {error && <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-ivory/70">
              <th className="py-4 pr-6">User ID</th>
              <th className="py-4 pr-6">Full Name</th>
              <th className="py-4 pr-6">Email</th>
              <th className="py-4 pr-6">Phone</th>
              <th className="py-4 pr-6">Role</th>
              <th className="py-4 pr-6">Joined</th>
              <th className="py-4 pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.userId} className="border-b border-white/10">
                <td className="py-4 pr-6 text-ivory/70">{user.userId}</td>
                <td className="py-4 pr-6">{user.fullName}</td>
                <td className="py-4 pr-6">{user.email}</td>
                <td className="py-4 pr-6">{user.phone}</td>
                <td className="py-4 pr-6 uppercase tracking-[0.14em] text-champagne">{user.role}</td>
                <td className="py-4 pr-6">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="py-4 pr-6 space-x-2">
                  <button className="btn-secondary" onClick={() => setSelected(user)}>Edit</button>
                  <button className="btn-secondary border-red-400/25 text-red-100 hover:bg-red-500" onClick={() => deleteUser(user.userId)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="mt-8 rounded-3xl border border-white/10 bg-midnight p-6">
          <h3 className="text-xl font-semibold text-champagne">Edit User</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label>
              <span className="label">Full Name</span>
              <input
                className="field"
                value={selected.fullName}
                onChange={(event) => setSelected((user) => ({ ...user, fullName: event.target.value }))}
              />
            </label>
            <label>
              <span className="label">Phone</span>
              <input
                className="field"
                value={selected.phone}
                onChange={(event) => setSelected((user) => ({ ...user, phone: event.target.value }))}
              />
            </label>
            <label className="md:col-span-2">
              <span className="label">Role</span>
              <select
                className="field"
                value={selected.role}
                onChange={(event) => setSelected((user) => ({ ...user, role: event.target.value }))}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <LoadingButton loading={saving} className="btn-primary" onClick={() => saveUser(selected.userId, selected)}>
              Save Changes
            </LoadingButton>
            <button type="button" className="btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
