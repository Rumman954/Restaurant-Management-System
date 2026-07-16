const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    foodId: { type: String, default: "" },
    fname: { type: String, required: true, trim: true },
    price: { type: Number, default: 250 },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    foodName: { type: String, required: true, trim: true },
    orderId: { type: String, required: true, trim: true },
    price: { type: Number, default: 250 },
    status: { type: String, enum: ["pending", "progress", "delivered"], default: "pending" },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    vat: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    deliveryType: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
    address: { type: String, default: "" },
    paymentMethod: { type: String, enum: ["cod", "online", "pickup"], default: "pickup" },
    paymentStatus: { type: String, enum: ["pending", "paid", "unpaid"], default: "pending" },
    stripePaymentIntentId: { type: String, default: "" },
    agreedToTerms: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", schema);
