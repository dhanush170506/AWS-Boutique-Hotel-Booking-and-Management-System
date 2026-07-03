const BookingStore = require("../models/BookingStore");
const RoomStore = require("../models/RoomStore");
const { publishBookingConfirmation } = require("../services/sns");
const { invokeBookingLambda } = require("../services/lambda");

const store = new BookingStore();
const roomStore = new RoomStore();

const requiredFields = [
  "customerName",
  "email",
  "phone",
  "roomType",
  "guests",
  "checkInDate",
  "checkOutDate",
  "bedPreference",
];

function validateBooking(payload) {
  const missing = requiredFields.filter((field) => !payload[field]);
  if (missing.length) {
    return `Missing required fields: ${missing.join(", ")}`;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return "Please provide a valid email address.";
  }

  if (Number(payload.guests) < 1) {
    return "Guests must be at least 1.";
  }

  if (new Date(payload.checkOutDate) <= new Date(payload.checkInDate)) {
    return "Check-out date must be after check-in date.";
  }

  return null;
}

function validateBookingUpdate(payload) {
  if (payload.guests !== undefined && Number(payload.guests) < 1) {
    return "Guests must be at least 1.";
  }

  if (
    payload.checkInDate &&
    payload.checkOutDate &&
    new Date(payload.checkOutDate) <= new Date(payload.checkInDate)
  ) {
    return "Check-out date must be after check-in date.";
  }

  return null;
}

async function createBooking(req, res, next) {
  try {
    const payload = {
      ...req.body,
      userId: req.user?.userId || req.body.userId,
    };
    const validationError = validateBooking(payload);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    let room = null;
    if (payload.roomId) {
      room = await roomStore.findById(payload.roomId);
    }
    if (!room && payload.roomType) {
      room = await roomStore.findByName(payload.roomType);
    }
    if (!room) {
      return res.status(404).json({ message: "Selected room not found." });
    }
    if (Number(room.availableRooms || 0) <= 0) {
      return res.status(400).json({
        message: "Selected room is fully booked for the selected dates.",
      });
    }

    const booking = await store.create({
      ...payload,
      roomId: room.roomId,
      roomType: room.roomName || room.name || room.roomType,
      roomName: room.roomName || room.name || room.roomType,
      roomPrice: room.price,
    });
    try {
      await invokeBookingLambda(booking);
    } catch (lambdaError) {
      console.error("Failed to invoke Lambda:", lambdaError);
    }
    await roomStore.updateAvailability(room.roomId, false);

    try {
      await publishBookingConfirmation(booking);
    } catch (snsError) {
      console.error(
        "Failed to publish booking confirmation SNS message:",
        snsError,
      );
    }

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

async function getBookings(_req, res, next) {
  try {
    const bookings = await store.findAll();
    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

async function getBookingsByUser(req, res, next) {
  try {
    const viewerRole = String(req.user.role || "")
      .trim()
      .toLowerCase();
    if (viewerRole !== "admin" && req.user.userId !== req.params.userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: you can only view your own bookings." });
    }
    const bookings = await store.findByUser(req.params.userId);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

async function getBookingById(req, res, next) {
  try {
    const booking = await store.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }
    const viewerRole = String(req.user.role || "")
      .trim()
      .toLowerCase();
    if (viewerRole !== "admin" && booking.userId !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: you can only view your own bookings." });
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function updateBooking(req, res, next) {
  try {
    const validationError = validateBookingUpdate(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const booking = await store.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }
    if (req.user.role !== "Admin" && booking.userId !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own bookings." });
    }

    const updated = await store.update(req.params.id, {
      ...req.body,
      userId: booking.userId,
    });
    try {
      await publishBookingConfirmation(updated);
    } catch (snsError) {
      console.error("SNS Error:", snsError);
    }
    if (!updated) {
      return res.status(404).json({ message: "Booking not found." });
    }
    if (updated.cancelled) {
      return res
        .status(400)
        .json({ message: "Cancelled bookings cannot be edited." });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteBooking(req, res, next) {
  try {
    const existing = await store.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Booking not found." });
    }
    const viewerRole = String(req.user.role || "")
      .trim()
      .toLowerCase();
    if (viewerRole !== "admin" && existing.userId !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only cancel your own bookings." });
    }

    const hardDelete = req.query.hard === "true" && viewerRole === "admin";
    let booking;

    if (hardDelete) {
      booking = await store.delete(req.params.id);
    } else {
      booking = await store.cancel(req.params.id);
    }

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }
    if (existing.roomId && existing.bookingStatus !== "Cancelled") {
      await roomStore.updateAvailability(existing.roomId, true);
    }
    try {
      await publishBookingConfirmation(booking);
    } catch (snsError) {
      console.error("SNS Error:", snsError);
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getBookings,
  getBookingsByUser,
  getBookingById,
  updateBooking,
  deleteBooking,
};
