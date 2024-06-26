var express = require('express');
var router = express.Router();
let testimonialController = require("../Controller/testimonial.controller")

router.post("/addnew",testimonialController.addNew)
router.get("/viewAll",testimonialController.viewAll)
router.get("/viewById/:id",testimonialController.viewById)
router.post("/update/:id",testimonialController.updateById)
router.post("/delete/:id",testimonialController.deleteById)


module.exports = router;
