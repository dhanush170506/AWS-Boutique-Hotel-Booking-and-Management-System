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

async function createRoom(req, res, next) {
  try {
    const room = await store.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
}

async function updateRoom(req, res, next) {
  try {
    const room = await store.update(req.params.id, req.body);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }
    res.json(room);
  } catch (error) {
    next(error);
  }
}

async function deleteRoom(req, res, next) {
  try {
    const room = await store.delete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }
    res.json({ message: "Room deleted.", room });
  } catch (error) {
    next(error);
  }
}

module.exports = { getRooms, getRoomById, createRoom, updateRoom, deleteRoom };
