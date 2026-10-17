const Model = require("../models");
const authController = Model.auth;
const bcrypt = require("bcryptjs");
const { sign } = require("../lib/token");
const { jwtSecret } = require("../middleware/auth");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  const json = user.toJSON ? user.toJSON() : { ...user };
  delete json.password;
  delete json.token;
  return json;
}

function signToken(id) {
  return sign({ id }, jwtSecret(), 60 * 60 * 24);
}

function fail(res, status, message) {
  return res.status(status).json({ status, message });
}

const login = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) {
      return fail(res, 400, "Email and password are required.");
    }

    const user = await authController.findOne({ where: { email } });
    if (!user) {
      return fail(res, 400, "Please Register...");
    }

    let passwordOk = false;
    try {
      passwordOk = await bcrypt.compare(password, user.password || "");
    } catch (error) {
      passwordOk = false;
    }
    if (!passwordOk && user.password === password) {
      passwordOk = true;
      user.password = bcrypt.hashSync(password, 10);
    }
    if (!passwordOk) {
      return fail(res, 400, "Wrong Password.. Please Check");
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (adminEmail && email === adminEmail && user.role !== "admin") {
      user.role = "admin";
    }

    const token = signToken(user.id);
    user.token = token;
    await user.save();

    const safe = publicUser(user);
    return res.json({
      status: 200,
      message: "SUCCESS",
      data: { token, Admindata: [safe], user: safe },
    });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const addNew = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const name = String(req.body.name || "").trim();
    if (!EMAIL_RE.test(email)) {
      return fail(res, 400, "Enter a valid email address.");
    }
    if (password.length < 6) {
      return fail(res, 400, "Password must be at least 6 characters.");
    }

    const existing = await authController.findOne({ where: { email } });
    if (existing) {
      return fail(res, 400, "This email already has an account");
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const user = await authController.create({
      name: name || email.split("@")[0],
      email,
      password: bcrypt.hashSync(password, 10),
      role: adminEmail && email === adminEmail ? "admin" : "customer",
    });
    const token = signToken(user.id);
    user.token = token;
    await user.save();

    return res.json({
      status: 200,
      message: "SUCCESS",
      data: { id: user.id, token, user: publicUser(user) },
    });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const viewAll = async (req, res) => {
  try {
    const data = await authController.findAll({
      attributes: { exclude: ["password", "token"] },
      order: [["createdAt", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const viewById = async (req, res) => {
  try {
    const data = await authController.findOne({
      where: { id: req.params.id },
      attributes: { exclude: ["password", "token"] },
    });
    if (!data) return fail(res, 404, "Account not found.");
    return res.json(data);
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const updateById = async (req, res) => {
  try {
    const target = await authController.findByPk(req.params.id);
    if (!target) return fail(res, 404, "Account not found.");

    const isSelf = req.user && Number(req.user.id) === Number(target.id);
    const isAdmin = req.user && req.user.role === "admin";
    if (!isSelf && !isAdmin) {
      return fail(res, 403, "You can only update your own account.");
    }

    const next = {};
    if (req.body.name !== undefined) next.name = String(req.body.name).trim();
    if (req.body.email !== undefined) {
      const email = String(req.body.email).trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return fail(res, 400, "Enter a valid email address.");
      next.email = email;
    }
    if (req.body.password) {
      if (String(req.body.password).length < 6) {
        return fail(res, 400, "Password must be at least 6 characters.");
      }
      next.password = bcrypt.hashSync(String(req.body.password), 10);
    }
    if (isAdmin && req.body.role) next.role = req.body.role === "admin" ? "admin" : "customer";

    await target.update(next);
    return res.json({ status: 200, message: "Updated Successfully", data: publicUser(target) });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const deleteById = async (req, res) => {
  try {
    const removed = await authController.destroy({ where: { id: req.params.id } });
    if (!removed) return fail(res, 404, "Account not found.");
    return res.json({ status: 200, message: "deleted successfully" });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const updatePassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const raw = req.body.newPassword || req.body.password;
    const id = req.body.id;
    if (!raw || String(raw).length < 6) {
      return fail(res, 400, "Password must be at least 6 characters.");
    }
    if (!email && !id) {
      return fail(res, 400, "Email is required.");
    }

    const user = email
      ? await authController.findOne({ where: { email } })
      : await authController.findByPk(id);
    if (!user) return fail(res, 400, "No account found for that email.");

    user.password = bcrypt.hashSync(String(raw), 10);
    user.forgetpassword = null;
    user.token = null;
    await user.save();
    return res.json({ status: 200, message: "Updated Successfully" });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const me = async (req, res) => {
  return res.json({ status: 200, data: publicUser(req.user) });
};

module.exports = {
  addNew,
  viewAll,
  viewById,
  updateById,
  deleteById,
  login,
  updatePassword,
  me,
};
