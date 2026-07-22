const Category = require("./models/Category");
const Food = require("./models/Food");
const MENU_FOODS_SEED = require("./menuFoodsSeed.json");

const CATEGORY_NAME_BY_SLUG = {
  italian: "Italian",
  chinese: "Chinese",
  snacks: "Snacks",
  bangladeshi: "Bangladeshi",
  thai: "Thai",
};

async function ensureMenuFoods() {
  const categories = await Category.find().lean();
  const categoryByName = new Map(
    categories.map((category) => [String(category.name || "").trim().toLowerCase(), category])
  );

  for (const item of MENU_FOODS_SEED) {
    try {
      const categoryName = CATEGORY_NAME_BY_SLUG[item.categorySlug] || item.categorySlug;
      const category = categoryByName.get(String(categoryName).trim().toLowerCase());
      if (!category?._id) continue;

      const existing = await Food.findOne({ fname: item.fname });
      if (!existing) {
        await Food.create({
          categoryId: category._id,
          fname: item.fname,
          description: item.description || "",
          image: item.image || "",
          price: 0,
          available: true,
        });
        continue;
      }

      const patch = {};
      if (!existing.categoryId) patch.categoryId = category._id;
      if (!existing.image && item.image) patch.image = item.image;
      if (!String(existing.description || "").trim() && item.description) {
        patch.description = item.description;
      }
      if (Object.keys(patch).length) {
        await Food.updateOne({ _id: existing._id }, { $set: patch });
      }
    } catch (error) {
      if (error?.code !== 11000) throw error;
    }
  }
}

module.exports = { ensureMenuFoods };
