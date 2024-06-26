var express = require('express');
var router = express.Router();
let authController = require("../Controller/auth.controlle")

router.post("/addnew",authController.addNew)
router.get("/viewAll",authController.viewAll)
router.get("/viewById/:id",authController.viewById)
router.post("/update/:id",authController.updateById)
router.post("/delete/:id",authController.deleteById)
router.post("/forgetpassword",authController.updatePassword)
router.post("/login",authController.login)


module.exports = router;
