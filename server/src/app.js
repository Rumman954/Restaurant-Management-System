const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const catalogRoutes = require("./routes/catalogRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

function createApp() {
  const app = express();

  const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
    })
  );

  // Allow base64 food images from admin uploads (default 100kb is too small).
  app.use(express.json({ limit: "8mb" }));
  app.use(express.urlencoded({ extended: true, limit: "8mb" }));

  app.get("/", (_req, res) => res.json({ message: "MERN API running", ok: true }));
  app.get("/api/health", (_req, res) => res.json({ ok: true, message: "API healthy" }));
  app.get("/health", (_req, res) => res.json({ ok: true, message: "API healthy" }));

  app.use("/api/auth", authRoutes);
  app.use("/api", catalogRoutes);
  app.use("/api", orderRoutes);
  app.use("/api", adminRoutes);
  app.use("/api", employeeRoutes);

  return app;
}

module.exports = { createApp };
