const express = require("express");
const {
  getRoomById,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");
const { loadUser, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getRooms);
router.get("/:id", getRoomById);
router.post("/", loadUser, requireRole("Admin"), createRoom);
router.put("/:id", loadUser, requireRole("Admin"), updateRoom);
router.delete("/:id", loadUser, requireRole("Admin"), deleteRoom);

module.exports = router;
