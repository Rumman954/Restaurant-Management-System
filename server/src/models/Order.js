const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    foodName: { type: String, required: true, trim: true },
    orderId: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "progress", "delivered"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", schema);
