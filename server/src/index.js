require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const catalogRoutes = require("./routes/catalogRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ message: "MERN API running" }));
app.use("/api/auth", authRoutes);
app.use("/api", catalogRoutes);
app.use("/api", orderRoutes);
app.use("/api", adminRoutes);

const port = process.env.PORT || 5000;
connectDb()
  .then(() => app.listen(port, () => console.log(`Server on ${port}`)))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
