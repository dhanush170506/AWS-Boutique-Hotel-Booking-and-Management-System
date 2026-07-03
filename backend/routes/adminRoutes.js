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
const { uploadImageToS3 } = require("../services/s3");

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

router.post("/rooms/upload-image", async (req, res, next) => {
  try {
    const { fileName, contentType, base64 } = req.body || {};
    if (!fileName || !contentType || !base64) {
      return res
        .status(400)
        .json({ message: "Image upload payload is incomplete." });
    }
    const imageUrl = await uploadImageToS3({ fileName, contentType, base64 });
    res.json({ imageUrl });
  } catch (error) {
    next(error);
  }
});

router.get("/rooms", getRooms);
router.get("/rooms/:id", getRoomById);
router.post("/rooms", createRoom);
router.put("/rooms/:id", updateRoom);
router.delete("/rooms/:id", deleteRoom);

module.exports = router;
