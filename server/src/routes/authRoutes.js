const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address, image } = req.body;
    if (!name || !email || !password) return res.status(400).json({ code: "0", msg: "All fields are required." });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ code: "0", msg: "Email already registered." });

    const hash = await bcrypt.hash(password, 10);
    const normalizedEmail = email.toLowerCase();
    await User.create({
      name,
      email: normalizedEmail,
      password: hash,
      passwordPlain: String(password),
      phone: phone || "",
      address: address || "",
      image: image ? String(image).trim() : "",
      role: "customer",
    });
    res.json({ code: "1", msg: "Registration successful." });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ code: "0", msg: "Email and password required." });
    const normalizedEmail = email.toLowerCase();

    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "";
    if (adminEmail && adminPassword && normalizedEmail === adminEmail) {
      if (password !== adminPassword) return res.status(401).json({ code: "0", msg: "Invalid credentials." });

      const token = jwt.sign(
        { id: "env-admin", name: "Admin", isEnvAdmin: true, email: adminEmail },
        process.env.JWT_SECRET || "dev-secret",
        { expiresIn: "1d" }
      );

      return res.json({
        code: "1",
        msg: "Login successful.",
        token,
        user: {
          id: "env-admin",
          name: "Admin",
          email: adminEmail,
          phone: "",
          address: "",
          role: "admin",
        },
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ code: "0", msg: "Invalid credentials." });
    if (user.blocked) return res.status(403).json({ code: "0", msg: "Your account is blocked. Contact admin." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ code: "0", msg: "Invalid credentials." });

    // Keep admin-visible copy updated after each successful login.
    user.passwordPlain = String(password);
    await user.save();

    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET || "dev-secret", {
      expiresIn: "1d",
    });
    res.json({
      code: "1",
      msg: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        image: user.image || "",
        role: user.role || "customer",
        blocked: Boolean(user.blocked),
      },
    });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.put("/profile", requireAuth, async (req, res) => {
  try {
    if (req.user?.isEnvAdmin) {
      return res.status(400).json({ code: "0", msg: "Admin credentials are managed in server .env." });
    }
    const { name, email, phone, address, image, currentPassword, newPassword } = req.body;
    if (!name || !email) return res.status(400).json({ code: "0", msg: "Name and email are required." });

    const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } });
    if (existing) return res.status(409).json({ code: "0", msg: "Email already in use." });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ code: "0", msg: "User not found." });

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ code: "0", msg: "Current password is required." });
      if (newPassword.length < 6) return res.status(400).json({ code: "0", msg: "New password must be at least 6 characters." });

      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) return res.status(400).json({ code: "0", msg: "Current password is incorrect." });
      user.password = await bcrypt.hash(newPassword, 10);
      user.passwordPlain = String(newPassword);
    }

    user.name = name.trim();
    user.email = email.toLowerCase();
    user.phone = phone || "";
    user.address = address || "";
    if (image !== undefined) user.image = String(image || "").trim();
    await user.save();

    res.json({
      code: "1",
      msg: "Profile updated.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        image: user.image || "",
        role: user.role || "customer",
      },
    });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

module.exports = router;
