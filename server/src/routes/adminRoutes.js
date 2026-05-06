const express = require("express");
const User = require("../models/User");
const Food = require("../models/Food");
const Order = require("../models/Order");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/admin/overview", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [users, foods, orders] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }),
      Food.find().populate("categoryId", "name").sort({ createdAt: -1 }),
      Order.find().populate("userId", "name email").sort({ createdAt: -1 }),
    ]);

    res.json({
      stats: {
        totalUsers: users.length,
        totalFoods: foods.length,
        totalOrders: orders.length,
      },
      users,
      foods,
      orders,
    });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

module.exports = router;
