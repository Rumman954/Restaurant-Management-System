const express = require("express");
const Order = require("../models/Order");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const VAT_RATE = 0.05;
const DELIVERY_FEE = 80;
const DEFAULT_FOOD_PRICE = 250;

const createOrderId = () => `RSTGF${Math.floor(100000 + Math.random() * 900000)}`;

function unitPrice(value) {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : DEFAULT_FOOD_PRICE;
}

function buildTotals(items, deliveryType) {
  const subtotal = items.reduce((sum, item) => sum + unitPrice(item.price) * Number(item.quantity || 1), 0);
  if (deliveryType === "delivery") {
    const vat = Math.round(subtotal * VAT_RATE);
    const deliveryFee = DELIVERY_FEE;
    return { subtotal, vat, deliveryFee, total: subtotal + vat + deliveryFee };
  }
  return { subtotal, vat: 0, deliveryFee: 0, total: subtotal };
}

function summarizeFoodName(items) {
  if (!items.length) return "Food order";
  if (items.length === 1) return `${items[0].fname} x${items[0].quantity}`;
  return items.map((item) => `${item.fname} x${item.quantity}`).join(", ");
}

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
}

router.post("/orders", requireAuth, async (req, res) => {
  try {
    const { foodName } = req.body;
    if (!foodName || !foodName.trim()) return res.status(400).json({ code: "0", msg: "Food name is required." });

    const order = await Order.create({
      userId: req.user._id,
      foodName: foodName.trim(),
      orderId: createOrderId(),
      price: Number(req.body.price) > 0 ? Number(req.body.price) : 250,
    });

    res.json({ code: "1", msg: "Order placed.", order });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.post("/orders/checkout", requireAuth, async (req, res) => {
  try {
    const { items, deliveryType, address, paymentMethod, agreedToTerms, stripePaymentIntentId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ code: "0", msg: "Cart is empty." });
    }
    if (!agreedToTerms) {
      return res.status(400).json({ code: "0", msg: "Please agree to the terms and conditions." });
    }

    const type = deliveryType === "delivery" ? "delivery" : "pickup";
    if (type === "delivery" && (!address || !String(address).trim())) {
      return res.status(400).json({ code: "0", msg: "Delivery address is required." });
    }

    const normalizedItems = items.map((item) => ({
      foodId: String(item.id || item.foodId || ""),
      fname: String(item.fname || "Food item").trim(),
      price: unitPrice(item.price),
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));

    const totals = buildTotals(normalizedItems, type);
    const method = type === "pickup" ? "pickup" : paymentMethod === "online" ? "online" : "cod";

    if (type === "delivery" && !["cod", "online"].includes(method)) {
      return res.status(400).json({ code: "0", msg: "Please choose a payment method." });
    }

    if (method === "online") {
      if (!stripe) {
        return res.status(503).json({ code: "0", msg: "Online payment is not configured. Add STRIPE_SECRET_KEY to server .env." });
      }
      if (!stripePaymentIntentId) {
        return res.status(400).json({ code: "0", msg: "Payment confirmation is required for online payment." });
      }
      const intent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
      if (intent.status !== "succeeded") {
        return res.status(400).json({ code: "0", msg: "Payment was not completed. Please try again." });
      }
      if (Math.round(totals.total * 100) !== intent.amount) {
        return res.status(400).json({ code: "0", msg: "Payment amount does not match order total." });
      }
    }

    const order = await Order.create({
      userId: req.user._id,
      foodName: summarizeFoodName(normalizedItems),
      orderId: createOrderId(),
      price: totals.total,
      items: normalizedItems,
      subtotal: totals.subtotal,
      vat: totals.vat,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      deliveryType: type,
      address: type === "delivery" ? String(address).trim() : "",
      paymentMethod: method,
      paymentStatus: method === "online" ? "paid" : "pending",
      stripePaymentIntentId: method === "online" ? String(stripePaymentIntentId) : "",
      agreedToTerms: true,
    });

    res.json({ code: "1", msg: "Order placed successfully.", order });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.post("/orders/create-payment-intent", requireAuth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ code: "0", msg: "Stripe is not configured on the server." });
    }

    const { items, deliveryType } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ code: "0", msg: "Cart is empty." });
    }

    const normalizedItems = items.map((item) => ({
      price: unitPrice(item.price),
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));
    const totals = buildTotals(normalizedItems, deliveryType === "delivery" ? "delivery" : "pickup");

    if (deliveryType !== "delivery") {
      return res.status(400).json({ code: "0", msg: "Online payment is only available for home delivery." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totals.total * 100),
      currency: "bdt",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: String(req.user._id),
      },
    });

    res.json({
      code: "1",
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totals.total,
    });
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

router.get("/orders/my", requireAuth, async (req, res) => {
  try {
    const rows = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(rows);
  } catch (error) {
    res.status(500).json({ code: "0", msg: error.message });
  }
});

module.exports = router;
