const { Op } = require("sequelize");
const Model = require("../models");

const STATUSES = ["received", "processing", "shipped", "delivered", "cancelled"];

function fail(res, status, message) {
  return res.status(status).json({ status, message });
}

function unitPrice(product) {
  const sale = Number(product.salePrice);
  const price = Number(product.price);
  if (Number.isFinite(sale) && sale > 0 && sale < price) return sale;
  return price;
}

const createOrder = async (req, res) => {
  const transaction = await Model.sequelize.transaction();
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const billing = req.body.billing || {};
    const required = ["firstName", "lastName", "country", "street", "city", "state", "pin", "phone", "email"];
    const missing = required.filter((field) => !String(billing[field] || "").trim());
    if (!items.length) {
      await transaction.rollback();
      return fail(res, 400, "Your cart is empty.");
    }
    if (missing.length) {
      await transaction.rollback();
      return fail(res, 400, "Please complete the billing details.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(billing.email))) {
      await transaction.rollback();
      return fail(res, 400, "Enter a valid email address.");
    }

    const lines = [];
    for (const item of items) {
      const lookup = { transaction };
      if (Model.sequelize.getDialect() === "mysql") lookup.lock = transaction.LOCK.UPDATE;
      const product = await Model.product.findByPk(item.id, lookup);
      const quantity = Number(item.quantity);
      if (!product) {
        await transaction.rollback();
        return fail(res, 400, "A product in your cart is no longer available.");
      }
      if (!Number.isInteger(quantity) || quantity < 1) {
        await transaction.rollback();
        return fail(res, 400, "Choose a valid quantity.");
      }
      if (product.quantety < quantity) {
        await transaction.rollback();
        return fail(res, 400, `Only ${product.quantety} left for ${product.name}.`);
      }
      const price = unitPrice(product);
      lines.push({
        id: product.id,
        name: product.name,
        image: product.img,
        price,
        quantity,
        lineTotal: price * quantity,
      });
      await product.update({ quantety: product.quantety - quantity }, { transaction });
    }

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 49;
    const paymentMethod = ["Cash on Delivery", "Direct Bank Transfer"].includes(req.body.paymentMethod)
      ? req.body.paymentMethod
      : "Cash on Delivery";

    const order = await Model.customerOrder.create(
      {
        userId: req.user.id,
        orderNumber: `AG-${Date.now().toString().slice(-8)}`,
        items: lines,
        billing: {
          firstName: String(billing.firstName).trim(),
          lastName: String(billing.lastName).trim(),
          company: String(billing.company || "").trim(),
          country: String(billing.country).trim(),
          street: String(billing.street).trim(),
          apartment: String(billing.apartment || "").trim(),
          city: String(billing.city).trim(),
          state: String(billing.state).trim(),
          pin: String(billing.pin).trim(),
          phone: String(billing.phone).trim(),
          email: String(billing.email).trim().toLowerCase(),
        },
        subtotal,
        shipping,
        total: subtotal + shipping,
        paymentMethod,
        status: "received",
        notes: String(req.body.notes || "").trim(),
      },
      { transaction }
    );

    await transaction.commit();
    return res.json({ status: 200, message: "Order received", data: order });
  } catch (error) {
    await transaction.rollback();
    return fail(res, 400, error.message);
  }
};

const myOrders = async (req, res) => {
  try {
    const data = await Model.customerOrder.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    return res.json({ status: 200, data });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const viewAll = async (req, res) => {
  try {
    const data = await Model.customerOrder.findAll({ order: [["createdAt", "DESC"]] });
    return res.json({ status: 200, data });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const viewById = async (req, res) => {
  try {
    const order = await Model.customerOrder.findByPk(req.params.id);
    if (!order) return fail(res, 404, "Order not found.");
    const owns = req.user && Number(order.userId) === Number(req.user.id);
    const admin = req.user && req.user.role === "admin";
    if (!owns && !admin) return fail(res, 403, "You cannot view this order.");
    return res.json({ status: 200, data: order });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

const updateStatus = async (req, res) => {
  const transaction = await Model.sequelize.transaction();
  try {
    const order = await Model.customerOrder.findByPk(req.params.id, { transaction });
    if (!order) {
      await transaction.rollback();
      return fail(res, 404, "Order not found.");
    }
    const status = String(req.body.status || "");
    if (!STATUSES.includes(status)) {
      await transaction.rollback();
      return fail(res, 400, "Choose a valid order status.");
    }
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items || []) {
        const product = await Model.product.findByPk(item.id, { transaction });
        if (product) {
          await product.update({ quantety: product.quantety + Number(item.quantity || 0) }, { transaction });
        }
      }
    }
    await order.update({ status }, { transaction });
    await transaction.commit();
    return res.json({ status: 200, message: "Updated Successfully", data: order });
  } catch (error) {
    await transaction.rollback();
    return fail(res, 400, error.message);
  }
};

const summary = async (req, res) => {
  try {
    const [users, products, orders, lowStock] = await Promise.all([
      Model.auth.count(),
      Model.product.count(),
      Model.customerOrder.findAll({ order: [["createdAt", "DESC"]] }),
      Model.product.count({ where: { quantety: { [Op.lte]: 5 } } }),
    ]);
    const revenue = orders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    return res.json({
      status: 200,
      data: {
        users,
        products,
        orders: orders.length,
        revenue,
        lowStock,
        recentOrders: orders.slice(0, 6),
      },
    });
  } catch (error) {
    return fail(res, 400, error.message);
  }
};

module.exports = { createOrder, myOrders, viewAll, viewById, updateStatus, summary };
