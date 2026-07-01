const BookingStore = require("../models/BookingStore");
const { publishBookingConfirmation } = require("../services/sns");

const store = new BookingStore();

const requiredFields = [
  "customerName",
  "email",
  "phone",
  "roomType",
  "guests",
  "checkInDate",
  "checkOutDate",
  "bedPreference"
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
  if (!payload.userId) return "User ID is required.";

  if (payload.guests !== undefined && Number(payload.guests) < 1) {
    return "Guests must be at least 1.";
  }

  if (payload.checkInDate && payload.checkOutDate && new Date(payload.checkOutDate) <= new Date(payload.checkInDate)) {
    return "Check-out date must be after check-in date.";
  }

  return null;
}

async function createBooking(req, res, next) {
  try {
    const validationError = validateBooking(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const booking = await store.create(req.body);

    try {
      await publishBookingConfirmation(booking);
    } catch (snsError) {
      console.error("Failed to publish booking confirmation SNS message:", snsError);
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

    const booking = await store.update(req.params.id, req.body);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }
    if (booking.forbidden) {
      return res.status(403).json({ message: "You can only update your own bookings." });
    }
    if (booking.cancelled) {
      return res.status(400).json({ message: "Cancelled bookings cannot be edited." });
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function deleteBooking(req, res, next) {
  try {
    if (!req.body?.userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const existing = await store.findById(req.params.id);
    if (existing && existing.userId && existing.userId !== req.body.userId) {
      return res.status(403).json({ message: "You can only cancel your own bookings." });
    }
    const booking = await store.cancel(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
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
  deleteBooking
};
