const Model = require("../models");
const testimonialController = Model.testimonial;

function fail(res, status, message) {
  return res.status(status).json({ status, message });
}

const addNew = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const content = String(req.body.content || "").trim();
    const img = String(req.body.img || "").trim();
    if (!name || !content) return fail(res, 400, "Name and review are required.");
    const created = await testimonialController.create({ name, content, img });
    return res.json({ status: 200, message: "created successfully", data: created });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const viewAll = async (req, res) => {
  try {
    const data = await testimonialController.findAll({ order: [["createdAt", "DESC"]] });
    return res.json(data);
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const viewById = async (req, res) => {
  try {
    const data = await testimonialController.findOne({ where: { id: req.params.id } });
    if (!data) return fail(res, 404, "Review not found.");
    return res.json(data);
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const updateById = async (req, res) => {
  try {
    const existing = await testimonialController.findByPk(req.params.id);
    if (!existing) return fail(res, 404, "Review not found.");
    const next = {};
    ["name", "img", "content"].forEach((field) => {
      if (req.body[field] !== undefined) next[field] = String(req.body[field] || "").trim();
    });
    if (next.name === "") return fail(res, 400, "Name is required.");
    if (next.content === "") return fail(res, 400, "Review is required.");
    await existing.update(next);
    return res.json({ status: 200, message: "Updated Successfully", data: existing });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const deleteById = async (req, res) => {
  try {
    const removed = await testimonialController.destroy({ where: { id: req.params.id } });
    if (!removed) return fail(res, 404, "Review not found.");
    return res.json({ status: 200, message: "deleted successfully" });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

module.exports = { addNew, viewAll, viewById, updateById, deleteById };
