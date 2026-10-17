var express = require("express");
var router = express.Router();
const contactController = require("../Controller/contact.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.post("/addnew", requireAuth, contactController.addNew);
router.get("/viewAll", requireAuth, requireAdmin, contactController.viewAll);

module.exports = router;
