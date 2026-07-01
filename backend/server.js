require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5001;
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://3.237.76.223:5173",
];
const allowedOrigins = new Set(defaultAllowedOrigins);

for (const origin of (process.env.CORS_ALLOWED_ORIGINS || "").split(",")) {
  const normalizedOrigin = normalizeOrigin(origin);
  if (normalizedOrigin) allowedOrigins.add(normalizedOrigin);
}

function normalizeOrigin(origin) {
  if (!origin || !origin.trim()) return "";
  try {
    const url = new URL(origin.trim());
    return `${url.protocol}//${url.host}`;
  } catch (_error) {
    return "";
  }
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return allowedOrigins.has(normalizeOrigin(origin));
}

const corsOptions = {
  origin(origin, callback) {
    console.log(`[cors] Incoming Origin: ${origin || "none"}`);

    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    const error = new Error(`Not allowed by CORS: ${origin}`);
    error.status = 403;
    callback(error);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  optionsSuccessStatus: 204,
};

app.options("*", cors(corsOptions), (_req, res) => res.sendStatus(204));
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    service: "Boutique Hotel Booking API",
    status: "healthy",
    storage: "dynamodb",
    awsReady: ["DynamoDB", "S3", "Lambda", "SNS", "SES", "EC2"],
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/rooms", roomRoutes);

app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Unexpected server error",
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Boutique Hotel API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
