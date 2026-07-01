const express = require("express");
const { loadUser, requireRole } = require("../middleware/authMiddleware");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const {
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");
const { getAnalytics } = require("../controllers/adminController");

const router = express.Router();

router.use(loadUser, requireRole("admin"));

router.get("/analytics", getAnalytics);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/bookings", getBookings);
router.get("/bookings/:id", getBookingById);
router.put("/bookings/:id", updateBooking);
router.delete("/bookings/:id", deleteBooking);

router.get("/rooms", getRooms);
router.get("/rooms/:id", getRoomById);
router.post("/rooms", createRoom);
router.put("/rooms/:id", updateRoom);
router.delete("/rooms/:id", deleteRoom);

module.exports = router;
