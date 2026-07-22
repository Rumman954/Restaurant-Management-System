require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { createApp } = require("./app");
const connectDb = require("./config/db");
const { ensureDefaultCategories } = require("./ensureCategories");
const { ensureDemoUsers } = require("./ensureDemoUsers");

const app = createApp();
const port = process.env.PORT || 5000;

async function start() {
  await connectDb();
  await ensureDefaultCategories();
  await ensureDemoUsers();
  app.listen(port, () => {
    console.log(`Server on ${port}`);
    console.log(`Stripe: ${process.env.STRIPE_SECRET_KEY ? "configured" : "NOT configured"}`);
  });
}

start().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
