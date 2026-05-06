const express = require("express");
const Order = require("../models/Order");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const createOrderId = () => `RSTGF${Math.floor(100000 + Math.random() * 900000)}`;

router.post("/orders", requireAuth, async (req, res) => {
  try {
    const { foodName } = req.body;
    if (!foodName || !foodName.trim()) return res.status(400).json({ code: "0", msg: "Food name is required." });

    const order = await Order.create({
      userId: req.user._id,
      foodName: foodName.trim(),
      orderId: createOrderId(),
    });

    res.json({ code: "1", msg: "Order placed.", order });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.get("/orders/my", requireAuth, async (req, res) => {
  try {
    const rows = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(rows);
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

module.exports = router;
