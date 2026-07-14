require("dotenv").config();
const Category = require("./models/Category");

const DEFAULT_CATEGORIES = [
  {
    name: "Italian",
    shortDesc: "This is a popular category",
    longDesc: "Italian cuisine encompasses a wide variety of regional cuisines.",
    image: "/images/Italian.jpg",
  },
  {
    name: "Chinese",
    shortDesc: "Chinese cuisine is an important part of culture",
    longDesc: "Different styles from Cantonese to Sichuan are popular globally.",
    image: "/images/Chinese.jpg",
  },
  {
    name: "Snacks",
    shortDesc: "A snack is a small portion of food eaten between meals",
    longDesc: "Snacks are quick foods loved by everyone.",
    image: "/images/Snacks.jpg",
  },
  {
    name: "Bangladeshi",
    shortDesc: "Classic Bangladeshi flavors",
    longDesc: "This is a popular category of Bangladesh. Explore the Foods of this category!",
    image: "/images/Bangldeshi.jpg",
  },
  {
    name: "Thai",
    shortDesc: "Bold Thai flavors",
    longDesc: "This is a popular category of Bangladesh. Explore the Foods of this category!",
    image: "/images/Thai.jpg",
  },
];

async function ensureDefaultCategories() {
  for (const row of DEFAULT_CATEGORIES) {
    try {
      const existing = await Category.findOne({ name: row.name });
      if (!existing) {
        await Category.create(row);
        continue;
      }

      const patch = {};
      if (!existing.image) patch.image = row.image;
      if (!existing.longDesc) patch.longDesc = row.longDesc;
      if (!existing.shortDesc) patch.shortDesc = row.shortDesc;
      if (Object.keys(patch).length) {
        await Category.updateOne({ _id: existing._id }, { $set: patch });
      }
    } catch (error) {
      // Ignore race/duplicate-key while starting multiple processes.
      if (error?.code !== 11000) throw error;
    }
  }
}

module.exports = { ensureDefaultCategories, DEFAULT_CATEGORIES };

if (require.main === module) {
  const connectDb = require("./config/db");
  connectDb()
    .then(async () => {
      await ensureDefaultCategories();
      const rows = await Category.find().sort({ createdAt: 1 }).lean();
      console.log(rows.map((c) => ({ name: c.name, image: c.image })));
      process.exit(0);
    })
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
