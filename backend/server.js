require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// Allowed Origins
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://3.237.76.223:5173",
  "http://3.237.76.223",
];

const allowedOrigins = new Set(defaultAllowedOrigins);

// Add CLIENT_ORIGIN from .env
if (process.env.CLIENT_ORIGIN) {
  allowedOrigins.add(process.env.CLIENT_ORIGIN.trim());
}

// Add any comma-separated origins from .env
for (const origin of (process.env.CORS_ALLOWED_ORIGINS || "").split(",")) {
  if (origin.trim()) {
    allowedOrigins.add(origin.trim());
  }
}

function normalizeOrigin(origin) {
  if (!origin) return "";
  try {
    const url = new URL(origin);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
}

function isAllowedOrigin(origin) {
  if (!origin) return true;

  return allowedOrigins.has(normalizeOrigin(origin));
}

const corsOptions = {
  origin(origin, callback) {
    console.log("Incoming Origin:", origin);

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.log("Blocked Origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Unexpected server error",
  });
});

app.listen(PORT, () => {
  console.log(`Boutique Hotel API running on http://localhost:${PORT}`);
});
