const express = require("express");
const User = require("../models/User");
const Food = require("../models/Food");
const Category = require("../models/Category");
const Order = require("../models/Order");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/admin/overview", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [users, foods, categories, orders] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }),
      Food.find().populate("categoryId", "name").sort({ createdAt: -1 }),
      Category.find().sort({ name: 1 }),
      Order.find().populate("userId", "name email").sort({ createdAt: -1 }),
    ]);

    const totalRevenue = orders.reduce((sum, order) => {
      if (order.status !== "delivered") return sum;
      return sum + (Number(order.price) > 0 ? Number(order.price) : 250);
    }, 0);

    res.json({
      stats: {
        totalUsers: users.length,
        totalFoods: foods.length,
        totalOrders: orders.length,
        totalRevenue,
      },
      users,
      foods,
      categories,
      orders,
    });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.post("/admin/foods", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { fname, description, categoryId, image } = req.body;
    if (!fname || !String(fname).trim()) return res.status(400).json({ code: "0", msg: "Food name is required." });
    if (!categoryId) return res.status(400).json({ code: "0", msg: "Category is required." });

    const category = await Category.findById(categoryId);
    if (!category) return res.status(400).json({ code: "0", msg: "Category not found." });

    const food = await Food.create({
      fname: String(fname).trim(),
      description: description ? String(description).trim() : "",
      categoryId,
      image: image ? String(image).trim() : "",
    });
    await food.populate("categoryId", "name");

    res.status(201).json({ code: "1", msg: "Food added.", food });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.put("/admin/foods/:foodId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { foodId } = req.params;
    const { fname, description, categoryId, image } = req.body;

    const food = await Food.findById(foodId);
    if (!food) return res.status(404).json({ code: "0", msg: "Food not found." });

    if (fname !== undefined) {
      if (!String(fname).trim()) return res.status(400).json({ code: "0", msg: "Food name is required." });
      food.fname = String(fname).trim();
    }
    if (description !== undefined) food.description = String(description).trim();
    if (image !== undefined) food.image = String(image).trim();
    if (categoryId !== undefined) {
      const category = await Category.findById(categoryId);
      if (!category) return res.status(400).json({ code: "0", msg: "Category not found." });
      food.categoryId = categoryId;
    }

    await food.save();
    await food.populate("categoryId", "name");

    res.json({ code: "1", msg: "Food updated.", food });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.delete("/admin/foods/:foodId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { foodId } = req.params;
    const deleted = await Food.findByIdAndDelete(foodId);
    if (!deleted) return res.status(404).json({ code: "0", msg: "Food not found." });
    res.json({ code: "1", msg: "Food deleted." });
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
