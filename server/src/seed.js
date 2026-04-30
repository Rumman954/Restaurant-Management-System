require("dotenv").config();
const connectDb = require("./config/db");
const Category = require("./models/Category");
const Food = require("./models/Food");

const seed = async () => {
  await connectDb();
  await Category.deleteMany({});
  await Food.deleteMany({});

  const categories = await Category.insertMany([
    { name: "Italian", shortDesc: "This is a popular category", longDesc: "Italian cuisine encompasses a wide variety of regional cuisines." },
    { name: "Chinese", shortDesc: "Chinese cuisine is an important part of culture", longDesc: "Different styles from Cantonese to Sichuan are popular globally." },
    { name: "Snacks", shortDesc: "A snack is a small portion of food eaten between meals", longDesc: "Snacks are quick foods loved by everyone." },
  ]);

  await Food.insertMany([
    { categoryId: categories[0]._id, fname: "Pizza", description: "Flat bread-based dish topped with cheese and sauce." },
    { categoryId: categories[1]._id, fname: "Chowmein", description: "Stir-fried noodle dish with vegetables." },
    { categoryId: categories[2]._id, fname: "French Fries", description: "Crispy potato fries for snack lovers." },
  ]);

  console.log("Seed complete");
  process.exit(0);
};

seed().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
