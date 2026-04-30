const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ code: "0", msg: "All fields are required." });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ code: "0", msg: "Email already registered." });

    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hash });
    res.json({ code: "1", msg: "Registration successful." });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ code: "0", msg: "Email and password required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ code: "0", msg: "Invalid credentials." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ code: "0", msg: "Invalid credentials." });

    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "1d" });
    res.json({ code: "1", msg: "Login successful.", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

module.exports = router;
