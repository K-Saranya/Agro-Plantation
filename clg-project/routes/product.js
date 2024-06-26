var express = require('express');
var router = express.Router();
let productController = require("../Controller/product.controller")

router.post("/addnew",productController.addNew)
router.get("/viewAll",productController.viewAll)
router.get("/viewById/:id",productController.viewById)
router.post("/update/:id",productController.updateById)
router.post("/delete/:id",productController.deleteById)


module.exports = router;
