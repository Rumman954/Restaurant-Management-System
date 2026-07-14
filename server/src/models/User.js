const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    // Admin-only reveal copy (login still uses hashed `password`).
    passwordPlain: { type: String, default: "", select: false },
    image: { type: String, default: "" },
    phone: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    role: { type: String, enum: ["customer", "employee", "admin"], default: "customer" },
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", schema);
