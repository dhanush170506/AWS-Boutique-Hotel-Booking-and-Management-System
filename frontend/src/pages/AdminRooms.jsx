import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import SectionTitle from '../components/SectionTitle';
import LoadingButton from '../components/LoadingButton';
import { adminApi } from '../services/api';

const emptyRoom = {
  roomNumber: '',
  roomName: '',
  roomType: '',
  description: '',
  price: '',
  totalRooms: '',
  availableRooms: '',
  bedrooms: '',
  beds: '',
  maxGuests: '',
  status: 'Available',
  facilities: '',
  imageUrls: '',
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
      roomName: room.roomName || room.name || '',
      roomType: room.roomType || '',
      description: room.description || '',
      price: String(room.price || ''),
      totalRooms: String(room.totalRooms || ''),
      availableRooms: String(room.availableRooms || ''),
      bedrooms: String(room.bedrooms || ''),
      beds: String(room.beds || ''),
      maxGuests: String(room.maxGuests || room.capacity || ''),
      status: room.status || (Number(room.availableRooms || 0) > 0 ? 'Available' : 'Booked Out'),
      facilities: (room.facilities || room.amenities || []).join(', '),
      imageUrls: (room.imageUrls || room.images || []).join(', '),
    });
    setError('');
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  }

  async function saveRoom(event) {
    event.preventDefault();
    if (!form.roomName.trim() || !form.price || !form.totalRooms) {
      setError('Room name, price, and total rooms are required.');
      return;
    }

    const payload = {
      roomNumber: form.roomNumber.trim(),
      roomName: form.roomName.trim(),
      name: form.roomName.trim(),
      roomType: form.roomType.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      totalRooms: Number(form.totalRooms),
      availableRooms: Number(form.availableRooms || form.totalRooms),
      bedrooms: Number(form.bedrooms || 1),
      beds: Number(form.beds || 1),
      maxGuests: Number(form.maxGuests || 2),
      status: form.status,
      facilities: form.facilities.split(',').map((item) => item.trim()).filter(Boolean),
      amenities: form.facilities.split(',').map((item) => item.trim()).filter(Boolean),
      imageUrls: form.imageUrls.split(',').map((item) => item.trim()).filter(Boolean),
      images: form.imageUrls.split(',').map((item) => item.trim()).filter(Boolean),
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
      <SectionTitle eyebrow="Room management" title="Manage Hotel Rooms" description="Add, edit, and configure room inventory with modern hotel metadata." />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_460px]">
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-midnight p-4">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-ivory/70">
                <th className="py-4 pr-6">Room</th>
                <th className="py-4 pr-6">Type</th>
                <th className="py-4 pr-6">Price</th>
                <th className="py-4 pr-6">Available</th>
                <th className="py-4 pr-6">Total</th>
                <th className="py-4 pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roomRows.map((room) => (
                <tr key={room.roomId} className="border-b border-white/10 text-ivory/80">
                  <td className="py-4 pr-6">{room.roomNumber} / {room.roomName || room.name}</td>
                  <td className="py-4 pr-6">{room.roomType}</td>
                  <td className="py-4 pr-6">₹{Number(room.price || 0).toLocaleString('en-IN')}</td>
                  <td className="py-4 pr-6">{room.availableRooms}</td>
                  <td className="py-4 pr-6">{room.totalRooms}</td>
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
              ['Room Name', 'roomName'],
              ['Description', 'description'],
              ['Price', 'price'],
              ['Total Rooms', 'totalRooms'],
              ['Available Rooms', 'availableRooms'],
              ['Bedrooms', 'bedrooms'],
              ['Beds', 'beds'],
              ['Max Guests', 'maxGuests'],
              ['Status', 'status'],
            ].map(([label, key]) => (
              <label key={key}>
                <span className="label">{label}</span>
                {key === 'status' ? (
                  <select className="field" value={form[key]} onChange={(event) => updateField(key, event.target.value)}>
                    <option value="Available">Available</option>
                    <option value="Booked Out">Booked Out</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                ) : (
                  <input className="field" type={['price', 'totalRooms', 'availableRooms', 'bedrooms', 'beds', 'maxGuests'].includes(key) ? 'number' : 'text'} value={form[key]} onChange={(event) => updateField(key, event.target.value)} />
                )}
              </label>
            ))}

            <label>
              <span className="label">Facilities (comma separated)</span>
              <input className="field" value={form.facilities} onChange={(event) => updateField('facilities', event.target.value)} />
            </label>
            <label>
              <span className="label">Image URLs (comma separated)</span>
              <input className="field" value={form.imageUrls} onChange={(event) => updateField('imageUrls', event.target.value)} />
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
