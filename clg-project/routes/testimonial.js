var express = require("express");
var router = express.Router();
let testimonialController = require("../Controller/testimonial.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/viewAll", testimonialController.viewAll);
router.get("/viewById/:id", testimonialController.viewById);
router.post("/addnew", requireAuth, requireAdmin, testimonialController.addNew);
router.post("/update/:id", requireAuth, requireAdmin, testimonialController.updateById);
router.post("/delete/:id", requireAuth, requireAdmin, testimonialController.deleteById);

module.exports = router;
