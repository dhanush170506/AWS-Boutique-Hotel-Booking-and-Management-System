import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, CheckCircle, XCircle } from 'lucide-react';
import SectionTitle from '../components/SectionTitle';
import LoadingButton from '../components/LoadingButton';
import { adminApi } from '../services/api';

const emptyRoom = {
  roomNumber: '',
  name: '',
  roomType: '',
  description: '',
  price: '',
  totalRooms: '',
  availableRooms: '',
  capacity: '',
  bedType: '',
  roomSize: '',
  floor: '',
  view: '',
  smoking: 'No',
  breakfast: false,
  tv: false,
  wifi: false,
  ac: false,
  balcony: false,
  amenities: '',
  images: '',
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState(emptyRoom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.listRooms().then(setRooms).catch(() => setError('Unable to load rooms.'));
  }, []);

  function editRoom(room) {
    setSelectedRoom(room);
    setForm({
      roomNumber: room.roomNumber || '',
      name: room.name || '',
      roomType: room.roomType || '',
      description: room.description || '',
      price: String(room.price || ''),
      totalRooms: String(room.totalRooms || ''),
      availableRooms: String(room.availableRooms || ''),
      capacity: String(room.capacity || ''),
      bedType: room.bedType || '',
      roomSize: room.roomSize || '',
      floor: room.floor || '',
      view: room.view || '',
      smoking: room.smoking || 'No',
      breakfast: !!room.breakfast,
      tv: !!room.tv,
      wifi: !!room.wifi,
      ac: !!room.ac,
      balcony: !!room.balcony,
      amenities: (room.amenities || []).join(', '),
      images: (room.images || []).join(', '),
    });
    setError('');
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  }

  async function saveRoom(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.price || !form.totalRooms) {
      setError('Name, price, and total rooms are required.');
      return;
    }

    const payload = {
      roomNumber: form.roomNumber.trim(),
      name: form.name.trim(),
      roomType: form.roomType.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      totalRooms: Number(form.totalRooms),
      availableRooms: Number(form.availableRooms || form.totalRooms),
      capacity: Number(form.capacity || 1),
      bedType: form.bedType,
      roomSize: form.roomSize,
      floor: form.floor,
      view: form.view,
      smoking: form.smoking,
      breakfast: form.breakfast,
      tv: form.tv,
      wifi: form.wifi,
      ac: form.ac,
      balcony: form.balcony,
      amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
      images: form.images.split(',').map((item) => item.trim()).filter(Boolean),
    };

    try {
      setLoading(true);
      if (selectedRoom) {
        const updated = await adminApi.updateRoom(selectedRoom.roomId, payload);
        setRooms((current) => current.map((room) => (room.roomId === selectedRoom.roomId ? updated : room)));
      } else {
        const created = await adminApi.createRoom(payload);
        setRooms((current) => [created, ...current]);
      }
      setSelectedRoom(null);
      setForm(emptyRoom);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save room.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteRoom(roomId) {
    if (!window.confirm('Delete this room? Active bookings will be checked first.')) return;
    try {
      await adminApi.deleteRoom(roomId);
      setRooms((current) => current.filter((room) => room.roomId !== roomId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete room.');
    }
  }

  const roomRows = useMemo(() => rooms, [rooms]);

  return (
    <div className="rounded-3xl border border-white/10 bg-charcoal p-8">
      <SectionTitle eyebrow="Room management" title="Manage Hotel Rooms" description="Add, edit, and configure room inventory with capacity and room details." />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-midnight p-4">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-ivory/70">
                <th className="py-4 pr-6">Room</th>
                <th className="py-4 pr-6">Type</th>
                <th className="py-4 pr-6">Price</th>
                <th className="py-4 pr-6">Available</th>
                <th className="py-4 pr-6">Total</th>
                <th className="py-4 pr-6">Status</th>
                <th className="py-4 pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roomRows.map((room) => (
                <tr key={room.roomId} className="border-b border-white/10 text-ivory/80">
                  <td className="py-4 pr-6">{room.roomNumber} / {room.name}</td>
                  <td className="py-4 pr-6">{room.roomType}</td>
                  <td className="py-4 pr-6">₹{room.price.toLocaleString('en-IN')}</td>
                  <td className="py-4 pr-6">{room.availableRooms}</td>
                  <td className="py-4 pr-6">{room.totalRooms}</td>
                  <td className="py-4 pr-6">{room.available ? 'Enabled' : 'Disabled'}</td>
                  <td className="py-4 pr-6 space-x-2">
                    <button className="btn-secondary" onClick={() => editRoom(room)}>Edit</button>
                    <button className="btn-secondary border-red-400/25 text-red-100 hover:bg-red-500" onClick={() => deleteRoom(room.roomId)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={saveRoom} className="rounded-3xl border border-white/10 bg-midnight p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-ivory/60">Room form</p>
              <h2 className="mt-2 text-2xl font-semibold text-champagne">{selectedRoom ? 'Edit Room' : 'Add Room'}</h2>
            </div>
            <button type="button" className="btn-primary" onClick={() => { setSelectedRoom(null); setForm(emptyRoom); }}>
              <Plus size={16} /> Clear
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            {[
              ['Room Number', 'roomNumber'],
              ['Room Type', 'roomType'],
              ['Name', 'name'],
              ['Description', 'description'],
              ['Price', 'price'],
              ['Total Rooms', 'totalRooms'],
              ['Available Rooms', 'availableRooms'],
              ['Capacity', 'capacity'],
              ['Bed Type', 'bedType'],
              ['Room Size', 'roomSize'],
              ['Floor', 'floor'],
              ['View', 'view'],
            ].map(([label, key]) => (
              <label key={key}>
                <span className="label">{label}</span>
                <input
                  className="field"
                  type={['price', 'totalRooms', 'availableRooms', 'capacity'].includes(key) ? 'number' : 'text'}
                  value={form[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                />
              </label>
            ))}

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label">Smoking</span>
                <select className="field" value={form.smoking} onChange={(event) => updateField('smoking', event.target.value)}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </label>
              <label>
                <span className="label">Breakfast</span>
                <input type="checkbox" checked={form.breakfast} onChange={(event) => updateField('breakfast', event.target.checked)} className="mr-3" />
                Enabled
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label">TV</span>
                <input type="checkbox" checked={form.tv} onChange={(event) => updateField('tv', event.target.checked)} className="mr-3" />
                Enabled
              </label>
              <label>
                <span className="label">WiFi</span>
                <input type="checkbox" checked={form.wifi} onChange={(event) => updateField('wifi', event.target.checked)} className="mr-3" />
                Enabled
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label">AC</span>
                <input type="checkbox" checked={form.ac} onChange={(event) => updateField('ac', event.target.checked)} className="mr-3" />
                Enabled
              </label>
              <label>
                <span className="label">Balcony</span>
                <input type="checkbox" checked={form.balcony} onChange={(event) => updateField('balcony', event.target.checked)} className="mr-3" />
                Enabled
              </label>
            </div>

            <label>
              <span className="label">Amenities (comma separated)</span>
              <input className="field" value={form.amenities} onChange={(event) => updateField('amenities', event.target.value)} />
            </label>
            <label>
              <span className="label">Images (comma separated URLs)</span>
              <input className="field" value={form.images} onChange={(event) => updateField('images', event.target.value)} />
            </label>
          </div>

          {error && <div className="mt-5 rounded-3xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>}

          <div className="mt-6 flex flex-wrap gap-3">
            <LoadingButton loading={loading} type="submit" className="btn-primary">
              {selectedRoom ? 'Save Room' : 'Add Room'}
            </LoadingButton>
            {selectedRoom && (
              <button type="button" className="btn-secondary" onClick={() => { setSelectedRoom(null); setForm(emptyRoom); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
