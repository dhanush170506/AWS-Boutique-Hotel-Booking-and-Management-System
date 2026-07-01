const { UserStore, publicUser } = require("../models/UserStore");

const store = new UserStore();

function validateRegistration(payload) {
  if (!payload || typeof payload !== "object") return "Request body must be valid JSON.";
  const required = ["fullName", "email", "phone", "password", "confirmPassword"];
  const missing = required.filter((field) => !String(payload[field] || "").trim());
  if (missing.length) return `Missing required fields: ${missing.join(", ")}`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return "Please provide a valid email address.";
  if (payload.password.length < 6) return "Password must be at least 6 characters.";
  if (payload.password !== payload.confirmPassword) return "Password and Confirm Password must match.";
  return null;
}

function authError(error) {
  if (error.name === "ConditionalCheckFailedException") {
    return { status: 409, message: "Email is already registered." };
  }

  if (error.name === "ResourceNotFoundException") {
    return { status: 503, message: "Users table is not available. Please verify DynamoDB table configuration." };
  }

  if (error.name === "ValidationException") {
    return {
      status: 500,
      message: `Users table schema does not match the application configuration: ${error.message}`,
    };
  }

  return null;
}

async function register(req, res, next) {
  try {
    const validationError = validateRegistration(req.body);
    if (validationError) return res.status(400).json({ message: validationError });

    const existing = await store.findByEmail(req.body.email);
    if (existing) return res.status(409).json({ message: "Email is already registered." });

    const user = await store.create(req.body);
    res.status(201).json({ user });
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return res.status(mapped.status).json({ message: mapped.message });
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await store.findByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({ user: publicUser(user) });
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return res.status(mapped.status).json({ message: mapped.message });
    next(error);
  }
}

module.exports = { register, login };
