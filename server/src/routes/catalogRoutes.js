const express = require("express");
const Category = require("../models/Category");
const Food = require("../models/Food");

const router = express.Router();

router.get("/categories", async (_req, res) => {
  try {
    const rows = await Category.find().sort({ createdAt: 1 });
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/foods", async (req, res) => {
  try {
    const query = req.query.categoryId ? { categoryId: req.query.categoryId } : {};
    const rows = await Food.find(query).populate("categoryId", "name").sort({ createdAt: 1 });
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
