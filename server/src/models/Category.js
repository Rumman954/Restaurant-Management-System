const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    shortDesc: { type: String, default: "" },
    longDesc: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", schema);
