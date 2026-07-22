require("dotenv").config();
const Category = require("./models/Category");

const DEFAULT_CATEGORIES = [
  {
    name: "Italian",
    shortDesc: "Pasta, pizza, and classic Italian comfort food",
    longDesc: "Enjoy Italian favourites like pasta, pizza, risotto, and desserts — perfect for a hearty meal.",
    image: "/images/Italian.jpg",
  },
  {
    name: "Chinese",
    shortDesc: "Noodles, dumplings, and wok-style dishes",
    longDesc: "From noodles and dumplings to stir-fried specials, explore bold Chinese flavours made to order.",
    image: "/images/Chinese.jpg",
  },
  {
    name: "Snacks",
    shortDesc: "Quick bites, drinks, and evening treats",
    longDesc: "Light snacks, tea, coffee, fries, rolls, and street-style bites for any time of day.",
    image: "/images/Snacks.jpg",
  },
  {
    name: "Bangladeshi",
    shortDesc: "Home-style Bengali meals and classics",
    longDesc: "Traditional Bangladeshi dishes — biryani, bhuna, bhorta, fish curry, and sweets prepared with care.",
    image: "/images/Bangldeshi.jpg",
  },
  {
    name: "Thai",
    shortDesc: "Curries, noodles, and Thai street food",
    longDesc: "Taste Thai classics like Pad Thai, green curry, Tom Yum, and fresh salads with aromatic spices.",
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
      // Refresh weak / placeholder descriptions when present.
      const weakLong =
        !existing.longDesc ||
        /popular category of Bangladesh|Explore the Foods of this category/i.test(existing.longDesc);
      const weakShort = !existing.shortDesc || /^This is a popular category$/i.test(existing.shortDesc);
      if (weakLong) patch.longDesc = row.longDesc;
      if (weakShort) patch.shortDesc = row.shortDesc;
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
