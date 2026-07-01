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
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const PUBLIC_HOST = process.env.PUBLIC_HOST || "3.237.76.223";
const allowedOrigins = new Set([
  CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://3.237.76.223",
  "http://3.237.76.223:5173",
]);

for (const origin of (process.env.CORS_ALLOWED_ORIGINS || "").split(",")) {
  if (origin.trim()) allowedOrigins.add(origin.trim());
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === PUBLIC_HOST
    );
  } catch (_error) {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      console.log("Incoming Origin:", origin);

      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 204,
  }),
);
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
  const status =
    err.status || (err.message === "Not allowed by CORS" ? 403 : 500);
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
