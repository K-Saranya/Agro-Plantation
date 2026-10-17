const Model = require("../models");

function fail(res, status, message) {
  return res.status(status).json({ status, message });
}

const addNew = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim();
    const message = String(req.body.message || "").trim();
    if (name.length < 2) return fail(res, 400, "Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, "Enter a valid email address.");
    if (message.length < 8) return fail(res, 400, "Please write a slightly longer message.");
    const created = await Model.contactMessage.create({ name, email, phone, message });
    return res.json({ status: 200, message: "Message sent", data: { id: created.id } });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const viewAll = async (req, res) => {
  try {
    const data = await Model.contactMessage.findAll({ order: [["createdAt", "DESC"]] });
    return res.json({ status: 200, data });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

module.exports = { addNew, viewAll };
