const express = require("express");
const {
  getRoomById,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomBookings,
} = require("../controllers/roomController");
const { loadUser, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getRooms);
router.get("/:id", getRoomById);
router.get("/:id/bookings", loadUser, requireRole("admin"), getRoomBookings);
router.post("/", loadUser, requireRole("admin"), createRoom);
router.put("/:id", loadUser, requireRole("admin"), updateRoom);
router.delete("/:id", loadUser, requireRole("admin"), deleteRoom);

module.exports = router;
