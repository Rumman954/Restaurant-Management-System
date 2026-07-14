const express = require("express");
const User = require("../models/User");
const Food = require("../models/Food");
const Category = require("../models/Category");
const Order = require("../models/Order");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/admin/overview", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [users, foods, categories, orders, orderCounts] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }).lean(),
      Food.find().populate("categoryId", "name").sort({ createdAt: -1 }),
      Category.find().sort({ name: 1 }),
      Order.find().populate("userId", "name email").sort({ createdAt: -1 }),
      Order.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]),
    ]);

    const orderCountMap = new Map(orderCounts.map((row) => [String(row._id), row.count]));
    const usersWithMeta = users.map((user) => ({
      ...user,
      orderCount: orderCountMap.get(String(user._id)) || 0,
      passwordDisplay: "••••••••",
    }));

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
      users: usersWithMeta,
      foods,
      categories,
      orders,
    });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.put("/admin/users/:userId/role", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const role = String(req.body?.role || "")
      .trim()
      .toLowerCase();
    if (!["customer", "employee", "admin"].includes(role)) {
      return res.status(400).json({ code: "0", msg: "Invalid role." });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ code: "0", msg: "User not found." });

    user.role = role;
    await user.save();

    res.json({ code: "1", msg: `User role updated to ${role}.`, user });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.put("/admin/users/:userId/block", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const blocked = Boolean(req.body?.blocked);

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ code: "0", msg: "User not found." });
    if (user.role === "admin" && blocked) {
      return res.status(400).json({ code: "0", msg: "Admin accounts cannot be blocked." });
    }

    user.blocked = blocked;
    await user.save();

    res.json({
      code: "1",
      msg: blocked ? "User blocked." : "User unblocked.",
      user,
    });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.get("/admin/users/:userId/password", requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("+passwordPlain name email");
    if (!user) return res.status(404).json({ code: "0", msg: "User not found." });
    const password = user.passwordPlain || "";
    if (!password) {
      return res.status(404).json({
        code: "0",
        msg: "Password not available yet. Ask this user to login once, or set a new password below.",
        password: "",
      });
    }
    res.json({ code: "1", msg: "Password loaded.", password });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.put("/admin/users/:userId/password", requireAuth, requireAdmin, async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const nextPassword = String(req.body?.password || "").trim();
    if (!nextPassword || nextPassword.length < 4) {
      return res.status(400).json({ code: "0", msg: "Password must be at least 4 characters." });
    }

    const user = await User.findById(req.params.userId).select("+passwordPlain");
    if (!user) return res.status(404).json({ code: "0", msg: "User not found." });

    user.password = await bcrypt.hash(nextPassword, 10);
    user.passwordPlain = nextPassword;
    await user.save();

    res.json({ code: "1", msg: "Password updated.", password: nextPassword });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.put("/admin/users/:userId/image", requireAuth, requireAdmin, async (req, res) => {
  try {
    const image = req.body?.image !== undefined ? String(req.body.image).trim() : "";
    const user = await User.findById(req.params.userId).select("-password -passwordPlain");
    if (!user) return res.status(404).json({ code: "0", msg: "User not found." });
    user.image = image;
    await user.save();
    res.json({ code: "1", msg: "User photo updated.", user });
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

router.post("/admin/categories", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, shortDesc, longDesc, image } = req.body;
    if (!name || !String(name).trim()) return res.status(400).json({ code: "0", msg: "Category name is required." });

    const exists = await Category.findOne({ name: String(name).trim() });
    if (exists) return res.status(400).json({ code: "0", msg: "Category already exists." });

    const category = await Category.create({
      name: String(name).trim(),
      shortDesc: shortDesc ? String(shortDesc).trim() : "",
      longDesc: longDesc ? String(longDesc).trim() : "",
      image: image ? String(image).trim() : "",
    });

    res.status(201).json({ code: "1", msg: "Category added.", category });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.put("/admin/categories/:categoryId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, shortDesc, longDesc, image } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ code: "0", msg: "Category not found." });

    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ code: "0", msg: "Category name is required." });
      const duplicate = await Category.findOne({ name: String(name).trim(), _id: { $ne: categoryId } });
      if (duplicate) return res.status(400).json({ code: "0", msg: "Category already exists." });
      category.name = String(name).trim();
    }
    if (shortDesc !== undefined) category.shortDesc = String(shortDesc).trim();
    if (longDesc !== undefined) category.longDesc = String(longDesc).trim();
    if (image !== undefined) category.image = String(image).trim();

    await category.save();
    res.json({ code: "1", msg: "Category updated.", category });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.delete("/admin/categories/:categoryId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ code: "0", msg: "Category not found." });

    const foodCount = await Food.countDocuments({ categoryId });
    if (foodCount > 0) {
      return res.status(400).json({
        code: "0",
        msg: `Cannot delete. ${foodCount} food(s) still use this category.`,
      });
    }

    await Category.findByIdAndDelete(categoryId);
    res.json({ code: "1", msg: "Category deleted." });
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
