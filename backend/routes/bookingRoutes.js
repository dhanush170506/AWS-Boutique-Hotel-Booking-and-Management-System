const express = require("express");
const {
  createBooking,
  getBookings,
  getBookingsByUser,
  getBookingById,
  updateBooking,
  deleteBooking
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/", createBooking);
router.get("/", getBookings);
router.get("/user/:userId", getBookingsByUser);
router.get("/:id", getBookingById);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

module.exports = router;
