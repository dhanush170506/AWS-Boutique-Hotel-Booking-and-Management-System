const express = require("express");
const {
  createBooking,
  getBookings,
  getBookingsByUser,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");
const { loadUser, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", loadUser, createBooking);
router.get("/", loadUser, requireRole("Admin"), getBookings);
router.get("/user/:userId", loadUser, getBookingsByUser);
router.get("/:id", loadUser, getBookingById);
router.put("/:id", loadUser, updateBooking);
router.delete("/:id", loadUser, deleteBooking);

module.exports = router;
