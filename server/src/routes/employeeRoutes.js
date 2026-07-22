const express = require("express");
const User = require("../models/User");
const Food = require("../models/Food");
const Category = require("../models/Category");
const Order = require("../models/Order");
const { requireAuth, requireEmployee } = require("../middleware/auth");

const router = express.Router();

router.get("/employee/dashboard", requireAuth, requireEmployee, async (_req, res) => {
  try {
    const [users, foods, categories, orders, orderCounts] = await Promise.all([
      User.find().select("-password -passwordPlain").sort({ createdAt: -1 }).lean(),
      Food.find().populate("categoryId", "name").sort({ fname: 1 }),
      Category.find().sort({ name: 1 }),
      Order.find().populate("userId", "name email phone address").sort({ createdAt: -1 }),
      Order.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]),
    ]);

    const orderCountMap = new Map(orderCounts.map((row) => [String(row._id), row.count]));
    const usersWithMeta = users.map((user) => ({
      ...user,
      orderCount: orderCountMap.get(String(user._id)) || 0,
    }));

    const newOrders = orders.filter((order) => order.status === "pending").length;
    const pendingOrders = orders.filter((order) => order.status === "progress").length;
    const deliveredOrders = orders.filter((order) => order.status === "delivered").length;

    res.json({
      stats: {
        totalUsers: users.length,
        newOrders,
        pendingOrders,
        deliveredOrders,
        totalFoods: foods.length,
        unavailableFoods: foods.filter((food) => food.available === false).length,
      },
      users: usersWithMeta,
      foods,
      categories,
      orders,
    });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.put("/employee/foods/:foodId", requireAuth, requireEmployee, async (req, res) => {
  try {
    const { foodId } = req.params;
    const { fname, description, price, available } = req.body;

    const food = await Food.findById(foodId);
    if (!food) return res.status(404).json({ code: "0", msg: "Food not found." });

    if (fname !== undefined) {
      if (!String(fname).trim()) return res.status(400).json({ code: "0", msg: "Food name is required." });
      food.fname = String(fname).trim();
    }
    if (description !== undefined) food.description = String(description).trim();
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (price !== "" && (Number.isNaN(parsedPrice) || parsedPrice < 0)) {
        return res.status(400).json({ code: "0", msg: "Price must be a valid number (0 or greater)." });
      }
      food.price = parsedPrice > 0 ? parsedPrice : 0;
    }
    if (available !== undefined) food.available = Boolean(available);

    await food.save();
    await food.populate("categoryId", "name");

    res.json({ code: "1", msg: "Food updated.", food });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.put("/employee/orders/:orderId/confirm", requireAuth, requireEmployee, async (req, res) => {
  try {
    const { orderId } = req.params;
    const updated = await Order.findByIdAndUpdate(orderId, { status: "progress" }, { new: true }).populate(
      "userId",
      "name email phone address"
    );
    if (!updated) return res.status(404).json({ code: "0", msg: "Order not found." });
    res.json({ code: "1", msg: "Order confirmed and moved to pending.", order: updated });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.put("/employee/orders/:orderId/deliver", requireAuth, requireEmployee, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ code: "0", msg: "Order not found." });

    order.status = "delivered";
    await order.save();
    await order.populate("userId", "name email phone address");

    res.json({ code: "1", msg: "Order marked as delivered.", order });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.put("/employee/orders/:orderId/status", requireAuth, requireEmployee, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const allowed = ["pending", "progress", "delivered"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ code: "0", msg: "Invalid order status." });
    }

    const updated = await Order.findByIdAndUpdate(orderId, { status }, { new: true }).populate(
      "userId",
      "name email phone address"
    );
    if (!updated) return res.status(404).json({ code: "0", msg: "Order not found." });

    res.json({ code: "1", msg: "Order status updated.", order: updated });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.put("/employee/users/:userId/block", requireAuth, requireEmployee, async (req, res) => {
  try {
    const { userId } = req.params;
    const blocked = Boolean(req.body?.blocked);

    const user = await User.findById(userId).select("-password -passwordPlain");
    if (!user) return res.status(404).json({ code: "0", msg: "User not found." });
    if (user.role !== "customer") {
      return res.status(400).json({ code: "0", msg: "Only customer accounts can be blocked." });
    }

    user.blocked = blocked;
    await user.save();

    res.json({
      code: "1",
      msg: blocked ? "Customer blocked." : "Customer unblocked.",
      user,
    });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

module.exports = router;
