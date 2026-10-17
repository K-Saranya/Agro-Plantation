const { verify } = require("../lib/token");
const Model = require("../models");

function jwtSecret() {
  return process.env.JWT_SECRET || "dev-only-change-me";
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return res.status(401).json({ status: 401, message: "Please sign in." });
  }
  try {
    const payload = verify(token, jwtSecret());
    const user = await Model.auth.findByPk(payload.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(401).json({ status: 401, message: "Account not found." });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: "Session expired. Please sign in again.",
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: 403, message: "Admin access required." });
  }
  return next();
}

module.exports = { requireAuth, requireAdmin, jwtSecret };
