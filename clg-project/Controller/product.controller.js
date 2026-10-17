const { Op, fn, col } = require("sequelize");
const Model = require("../models");
const productController = Model.product;

function fail(res, status, message) {
  return res.status(status).json({ status, message });
}

function cleanProduct(body, { partial } = { partial: false }) {
  const next = {};
  const textFields = ["name", "img", "dec", "cover1", "cover2", "cover3", "cover4", "category"];
  textFields.forEach((field) => {
    if (body[field] !== undefined) next[field] = String(body[field] || "").trim();
  });
  if (body.price !== undefined && body.price !== "") next.price = Number(body.price);
  if (body.quantety !== undefined && body.quantety !== "") next.quantety = Number(body.quantety);
  if (body.salePrice === "" || body.salePrice === null) next.salePrice = null;
  else if (body.salePrice !== undefined) next.salePrice = Number(body.salePrice);

  if (!partial || next.name !== undefined) {
    if (!next.name) return { error: "Product name is required." };
  }
  if (!partial || next.price !== undefined) {
    if (!Number.isFinite(next.price) || next.price < 0) return { error: "Enter a valid price." };
  }
  if (next.quantety !== undefined && (!Number.isInteger(next.quantety) || next.quantety < 0)) {
    return { error: "Stock must be a whole number." };
  }
  if (next.salePrice !== undefined && next.salePrice !== null) {
    if (!Number.isFinite(next.salePrice) || next.salePrice < 0) return { error: "Enter a valid sale price." };
  }
  if (!partial && next.quantety === undefined) next.quantety = 0;
  return { value: next };
}

const addNew = async (req, res) => {
  try {
    const parsed = cleanProduct(req.body);
    if (parsed.error) return fail(res, 400, parsed.error);
    const created = await productController.create(parsed.value);
    return res.json({ status: 200, message: "created successfully", data: created });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const viewAll = async (req, res) => {
  try {
    const where = {};
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
        { dec: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category && category.toLowerCase() !== "all") where.category = category;

    const sortMap = {
      price_asc: [["price", "ASC"]],
      price_desc: [["price", "DESC"]],
      name: [["name", "ASC"]],
      newest: [["createdAt", "DESC"]],
    };
    const order = sortMap[req.query.sort] || sortMap.newest;

    if (req.query.paged === "1") {
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 48);
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const result = await productController.findAndCountAll({
        where,
        order,
        limit,
        offset: (page - 1) * limit,
      });
      return res.json({
        status: 200,
        data: result.rows,
        total: result.count,
        page,
        pages: Math.max(Math.ceil(result.count / limit), 1),
      });
    }

    const data = await productController.findAll({ where, order });
    return res.json(data);
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const categories = async (req, res) => {
  try {
    const rows = await productController.findAll({
      attributes: ["category", [fn("COUNT", col("id")), "count"]],
      group: ["category"],
      order: [["category", "ASC"]],
    });
    const data = rows
      .map((row) => ({
        name: row.category,
        count: Number(row.get("count")),
      }))
      .filter((row) => row.name);
    return res.json({ status: 200, data });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const viewById = async (req, res) => {
  try {
    const data = await productController.findOne({ where: { id: req.params.id } });
    if (!data) return fail(res, 404, "Product not found.");
    return res.json(data);
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const updateById = async (req, res) => {
  try {
    const existing = await productController.findByPk(req.params.id);
    if (!existing) return fail(res, 404, "Product not found.");
    const parsed = cleanProduct(req.body, { partial: true });
    if (parsed.error) return fail(res, 400, parsed.error);
    await existing.update(parsed.value);
    return res.json({ status: 200, message: "Updated Successfully", data: existing });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const deleteById = async (req, res) => {
  try {
    const removed = await productController.destroy({ where: { id: req.params.id } });
    if (!removed) return fail(res, 404, "Product not found.");
    return res.json({ status: 200, message: "deleted successfully" });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const uploadImage = async (req, res) => {
  if (!req.file) return fail(res, 400, "Choose an image to upload.");
  return res.json({ status: 200, url: `/media/uploads/${req.file.filename}` });
};

module.exports = {
  addNew,
  viewAll,
  viewById,
  updateById,
  deleteById,
  categories,
  uploadImage,
};
