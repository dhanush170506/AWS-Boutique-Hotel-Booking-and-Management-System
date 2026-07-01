const { UserStore } = require("../models/UserStore");

const store = new UserStore();

function getUserId(req) {
  return (
    req.user?.userId ||
    req.user?.id ||
    req.headers["x-user-id"] ||
    req.query.userId
  );
}

async function getUsers(_req, res, next) {
  try {
    const users = await store.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await store.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const payload = { ...req.body };
    const user = await store.update(req.params.id, payload);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await store.delete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User deleted.", user });
  } catch (error) {
    next(error);
  }
}

async function getProfile(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res.status(400).json({ message: "User ID is required." });

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
    if (!userId)
      return res.status(400).json({ message: "User ID is required." });

    const payload = { ...req.body };
    delete payload.role;

    const user = await store.update(userId, payload);
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
};
