const { UserStore } = require("../models/UserStore");

const store = new UserStore();

async function loadUser(req, res, next) {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ message: "Missing x-user-id header." });
  }

  try {
    const user = await store.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid user credentials." });
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized access." });
    }
    if (req.user.role !== role) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient privileges." });
    }
    next();
  };
}

module.exports = { loadUser, requireRole };
