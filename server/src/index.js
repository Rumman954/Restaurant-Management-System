require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");
const { ensureDefaultCategories } = require("./ensureCategories");
const { ensureDemoUsers } = require("./ensureDemoUsers");
const authRoutes = require("./routes/authRoutes");
const catalogRoutes = require("./routes/catalogRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();
app.use(cors());
// Allow base64 food images from admin uploads (default 100kb is too small).
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));

app.get("/", (_req, res) => res.json({ message: "MERN API running" }));
app.use("/api/auth", authRoutes);
app.use("/api", catalogRoutes);
app.use("/api", orderRoutes);
app.use("/api", adminRoutes);
app.use("/api", employeeRoutes);

const port = process.env.PORT || 5000;
connectDb()
  .then(async () => {
    await ensureDefaultCategories();
    await ensureDemoUsers();
    app.listen(port, () => {
      console.log(`Server on ${port}`);
      console.log(`Stripe: ${process.env.STRIPE_SECRET_KEY ? "configured" : "NOT configured"}`);
    });
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
