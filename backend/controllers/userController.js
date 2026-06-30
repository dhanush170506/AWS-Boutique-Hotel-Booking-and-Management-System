const { UserStore } = require("../models/UserStore");

const store = new UserStore();

function getUserId(req) {
  return req.headers["x-user-id"] || req.query.userId;
}

async function getProfile(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ message: "User ID is required." });

    const user = await store.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ message: "User ID is required." });

    const user = await store.update(userId, req.body);
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile };
