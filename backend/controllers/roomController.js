const RoomStore = require("../models/RoomStore");

const store = new RoomStore();

async function getRooms(_req, res, next) {
  try {
    const rooms = await store.findAll();
    res.json(rooms);
  } catch (error) {
    next(error);
  }
}

async function getRoomById(req, res, next) {
  try {
    const room = await store.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }
    res.json(room);
  } catch (error) {
    next(error);
  }
}

module.exports = { getRooms, getRoomById };
