const mongoose = require("mongoose");

const connectDb = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGO_URI missing in .env");
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};

module.exports = connectDb;
