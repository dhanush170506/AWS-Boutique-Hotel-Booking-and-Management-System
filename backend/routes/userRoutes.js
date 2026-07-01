const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
} = require("../controllers/userController");
const { loadUser, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", loadUser, getProfile);
router.put("/profile", loadUser, updateProfile);

router.get("/", loadUser, requireRole("admin"), getUsers);
router.get("/:id", loadUser, requireRole("admin"), getUserById);
router.put("/:id", loadUser, requireRole("admin"), updateUser);
router.delete("/:id", loadUser, requireRole("admin"), deleteUser);

module.exports = router;
