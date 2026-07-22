const path = require("path");

// Resolve Express/mongoose deps from server/node_modules on Vercel.
const serverModules = path.join(__dirname, "../server/node_modules");
if (!module.paths.includes(serverModules)) {
  module.paths.unshift(serverModules);
}

const { createApp } = require("../server/src/app");
const connectDb = require("../server/src/config/db");
const { ensureDefaultCategories } = require("../server/src/ensureCategories");
const { ensureDemoUsers } = require("../server/src/ensureDemoUsers");
const { ensureMenuFoods } = require("../server/src/ensureMenuFoods");

const app = createApp();

let readyPromise;

async function ensureReady() {
  if (!readyPromise) {
    readyPromise = (async () => {
      await connectDb();
      await ensureDefaultCategories();
      await ensureMenuFoods();
      await ensureDemoUsers();
    })();
  }
  return readyPromise;
}

function normalizeApiUrl(req) {
  const original = req.url || "/";
  if (original === "/" || original.startsWith("/api")) return;
  req.url = "/api" + (original.startsWith("/") ? original : `/${original}`);
}

module.exports = async (req, res) => {
  try {
    await ensureReady();
    normalizeApiUrl(req);
    return app(req, res);
  } catch (error) {
    console.error("API bootstrap failed:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        ok: false,
        msg: error?.message || "API failed to start. Check MONGO_URI on Vercel.",
      })
    );
  }
};
