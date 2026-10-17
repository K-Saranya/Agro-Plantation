var express = require('express');
var router = express.Router();
let authController = require("../Controller/auth.controlle");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.post("/addnew", authController.addNew);
router.post("/login", authController.login);
router.post("/forgetpassword", authController.updatePassword);
router.get("/me", requireAuth, authController.me);
router.get("/viewAll", requireAuth, requireAdmin, authController.viewAll);
router.get("/viewById/:id", requireAuth, authController.viewById);
router.post("/update/:id", requireAuth, authController.updateById);
router.post("/delete/:id", requireAuth, requireAdmin, authController.deleteById);

module.exports = router;
