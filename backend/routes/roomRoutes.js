const express = require("express");
const { getRoomById, getRooms } = require("../controllers/roomController");

const router = express.Router();

router.get("/", getRooms);
router.get("/:id", getRoomById);

module.exports = router;
