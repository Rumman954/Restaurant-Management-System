const bcrypt = require("bcryptjs");
const User = require("./models/User");

const DEMO_USERS = [
  { name: "Demo Admin", email: "admin@gmail.com", password: "admin123", role: "admin" },
  { name: "Demo Employee", email: "employee@gmail.com", password: "employee123", role: "employee" },
  { name: "Demo Customer", email: "customer@gmail.com", password: "customer123", role: "customer" },
];

async function ensureDemoUsers() {
  await User.deleteMany({ email: /^rolex@gmail\.com$/i });

  for (const demo of DEMO_USERS) {
    const email = demo.email.toLowerCase();
    const hash = await bcrypt.hash(demo.password, 10);
    await User.findOneAndUpdate(
      { email },
      {
        name: demo.name,
        email,
        password: hash,
        passwordPlain: demo.password,
        role: demo.role,
        blocked: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

module.exports = { ensureDemoUsers };
