const RoomStore = require("../models/RoomStore");
const BookingStore = require("../models/BookingStore");

const store = new RoomStore();
const bookingStore = new BookingStore();

async function getRooms(_req, res, next) {
  try {
    const rooms = await store.findAll();
    res.json(rooms);
  } catch (error) {
    next(error);
  }
}

async function getRoomById(req, res, next) {
  try {
    const room = await store.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }
    res.json(room);
  } catch (error) {
    next(error);
  }
}

async function createRoom(req, res, next) {
  try {
    const payload = { ...req.body };
    const totalRooms = Number(payload.totalRooms ?? 1);
    const availableRooms = Number(payload.availableRooms ?? totalRooms);
    if (totalRooms < 1) {
      return res
        .status(400)
        .json({ message: "Total rooms must be at least 1." });
    }
    if (availableRooms > totalRooms) {
      return res
        .status(400)
        .json({ message: "Available rooms cannot exceed total rooms." });
    }
    const room = await store.create(payload);
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
}

async function updateRoom(req, res, next) {
  try {
    const existing = await store.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Room not found." });
    }

    const payload = { ...req.body };
    if (payload.totalRooms !== undefined) {
      const occupiedRooms = Math.max(
        0,
        Number(existing.totalRooms || 0) - Number(existing.availableRooms || 0),
      );
      if (Number(payload.totalRooms) < occupiedRooms) {
        return res
          .status(400)
          .json({
            message: "Total rooms cannot be less than already booked rooms.",
          });
      }
    }

    const room = await store.update(req.params.id, payload);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }
    res.json(room);
  } catch (error) {
    next(error);
  }
}

async function getRoomBookings(req, res, next) {
  try {
    const bookings = await bookingStore.findByRoom(req.params.id);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

async function deleteRoom(req, res, next) {
  try {
    const room = await store.delete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }
    res.json({ message: "Room deleted.", room });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRooms,
  getRoomById,
  getRoomBookings,
  createRoom,
  updateRoom,
  deleteRoom,
};
