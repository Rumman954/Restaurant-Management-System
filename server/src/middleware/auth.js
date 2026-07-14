const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
};

const requireAuth = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ code: "0", msg: "Unauthorized." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    if (decoded?.isEnvAdmin) {
      req.user = {
        _id: "env-admin",
        name: decoded.name || "Admin",
        email: decoded.email || process.env.ADMIN_EMAIL || "",
        role: "admin",
        isEnvAdmin: true,
      };
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ code: "0", msg: "Unauthorized." });
    if (user.blocked) return res.status(403).json({ code: "0", msg: "Account is blocked." });

    req.user = user;
    next();
  } catch (_error) {
    res.status(401).json({ code: "0", msg: "Invalid token." });
  }
};

const requireAdmin = (req, res, next) => {
  const isAdmin = Boolean(req.user?.isEnvAdmin) || req.user?.role === "admin";
  if (!req.user || !isAdmin) {
    return res.status(403).json({ code: "0", msg: "Admin access required." });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };
