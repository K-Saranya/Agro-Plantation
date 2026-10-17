var express = require("express");
var router = express.Router();
const orderController = require("../Controller/order.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.post("/addnew", requireAuth, orderController.createOrder);
router.get("/mine", requireAuth, orderController.myOrders);
router.get("/summary", requireAuth, requireAdmin, orderController.summary);
router.get("/viewAll", requireAuth, requireAdmin, orderController.viewAll);
router.get("/viewById/:id", requireAuth, orderController.viewById);
router.post("/status/:id", requireAuth, requireAdmin, orderController.updateStatus);

module.exports = router;
