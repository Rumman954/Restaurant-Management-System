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

router.put("/admin/orders/:orderId/confirm", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const updated = await Order.findByIdAndUpdate(orderId, { status: "progress" }, { new: true }).populate("userId", "name email");
    if (!updated) return res.status(404).json({ code: "0", msg: "Order not found." });
    res.json({ code: "1", msg: "Order moved to progress.", order: updated });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.put("/admin/orders/:orderId/deliver", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ code: "0", msg: "Order not found." });
    if (order.status !== "progress") return res.status(400).json({ code: "0", msg: "Only progress orders can be delivered." });

    order.status = "delivered";
    await order.save();
    await order.populate("userId", "name email");

    res.json({ code: "1", msg: "Order moved to delivered.", order });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

module.exports = router;
