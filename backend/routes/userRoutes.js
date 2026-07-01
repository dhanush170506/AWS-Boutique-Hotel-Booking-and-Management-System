const express = require("express");
const { getProfile, updateProfile } = require("../controllers/userController");
const { loadUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", loadUser, getProfile);
router.put("/profile", loadUser, updateProfile);

module.exports = router;
