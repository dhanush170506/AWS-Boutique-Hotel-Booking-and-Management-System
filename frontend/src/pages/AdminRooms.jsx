import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import SectionTitle from '../components/SectionTitle';
import LoadingButton from '../components/LoadingButton';
import { adminApi } from '../services/api';

const facilityOptions = [
  'WiFi',
  'Air Conditioner',
  'TV',
  'Bathroom',
  'Balcony',
  'Parking',
  'Room Service',
  'Breakfast Included',
  'Hot Water',
  'Mini Bar',
];

const emptyRoom = {
  roomName: '',
  roomType: '',
  description: '',
  price: '',
  totalRooms: '',
  facilities: [],
  imageUrl: '',
  imagePreview: '',
};

function getRoomImageUrl(room) {
  return room?.imageUrl || room?.imageUrls?.[0] || room?.images?.[0] || '';
}

function getAvailabilityLabel(room) {
  const totalRooms = Number(room?.totalRooms || room?.capacity || 1);
  const availableRooms = Number(room?.availableRooms ?? room?.available ?? totalRooms);
  if (availableRooms <= 0) return 'Booked Out';
  return `${availableRooms}/${totalRooms}`;
}

const roomFields = [
  ['Room Name', 'roomName'],
  ['Room Type', 'roomType'],
  ['Price', 'price'],
  ['Total Rooms', 'totalRooms'],
  ['Description', 'description'],
];

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState(emptyRoom);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.listRooms().then(setRooms).catch(() => setError('Unable to load rooms.'));
  }, []);

  function editRoom(room) {
    setSelectedRoom(room);
    setForm({
      roomName: room.roomName || room.name || '',
      roomType: room.roomType || '',
      description: room.description || '',
      price: String(room.price || ''),
      totalRooms: String(room.totalRooms || ''),
      facilities: room.facilities || room.amenities || [],
      imageUrl: getRoomImageUrl(room),
      imagePreview: getRoomImageUrl(room),
    });
    setError('');
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  }

  function toggleFacility(facility) {
    setForm((current) => {
      const facilities = current.facilities.includes(facility)
        ? current.facilities.filter((item) => item !== facility)
        : [...current.facilities, facility];
      return { ...current, facilities };
    });
    setError('');
  }

  async function handleImageSelection(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = () => reject(new Error('Unable to read the selected file.'));
        reader.readAsDataURL(file);
      });

      const uploaded = await adminApi.uploadImage({
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        base64,
      });

      updateField('imageUrl', uploaded.imageUrl);
      updateField('imagePreview', uploaded.imageUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to upload the selected image.');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  }

  async function saveRoom(event) {
    event.preventDefault();
    if (!form.roomName.trim() || !form.price || !form.totalRooms) {
      setError('Room name, price, and total rooms are required.');
      return;
    }

    const payload = {
      roomName: form.roomName.trim(),
      name: form.roomName.trim(),
      roomType: form.roomType.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      totalRooms: Number(form.totalRooms),
      facilities: form.facilities,
      amenities: form.facilities,
      imageUrl: form.imageUrl || '',
      imageUrls: form.imageUrl ? [form.imageUrl] : [],
      images: form.imageUrl ? [form.imageUrl] : [],
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
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_500px]">
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-midnight p-4">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-ivory/70">
                <th className="py-4 pr-6">Room</th>
                <th className="py-4 pr-6">Type</th>
                <th className="py-4 pr-6">Price</th>
                <th className="py-4 pr-6">Availability</th>
                <th className="py-4 pr-6">Total</th>
                <th className="py-4 pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roomRows.map((room) => (
                <tr key={room.roomId} className="border-b border-white/10 text-ivory/80">
                  <td className="py-4 pr-6">{room.roomName || room.name}</td>
                  <td className="py-4 pr-6">{room.roomType}</td>
                  <td className="py-4 pr-6">₹{Number(room.price || 0).toLocaleString('en-IN')}</td>
                  <td className="py-4 pr-6">{getAvailabilityLabel(room)}</td>
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
            {roomFields.map(([label, key]) => (
              <label key={key}>
                <span className="label">{label}</span>
                <input className="field" type={['price', 'totalRooms'].includes(key) ? 'number' : 'text'} value={form[key]} onChange={(event) => updateField(key, event.target.value)} />
              </label>
            ))}

            <div>
              <span className="label mb-2 block">Facilities</span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {facilityOptions.map((facility) => (
                  <label key={facility} className="flex items-center gap-2 text-sm text-ivory/70">
                    <input
                      type="checkbox"
                      checked={form.facilities.includes(facility)}
                      onChange={() => toggleFacility(facility)}
                      className="h-4 w-4 rounded border-white/20 accent-champagne"
                    />
                    <span>{facility}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className="label mb-2 block">Room Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelection}
                disabled={uploadingImage}
                className="hidden"
                id="room-image-upload"
              />
              <label htmlFor="room-image-upload" className="btn-secondary cursor-pointer">
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </label>
              {form.imagePreview && (
                <img src={form.imagePreview} alt="Preview" className="mt-3 h-32 w-full rounded-2xl object-cover" />
              )}
            </div>
          </div>

          {error && <div className="mt-5 rounded-3xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>}

          <div className="mt-6 flex flex-wrap gap-3">
            <LoadingButton loading={loading || uploadingImage} type="submit" className="btn-primary">
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