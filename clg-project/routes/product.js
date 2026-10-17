var express = require("express");
var path = require("path");
var multer = require("multer");
var router = express.Router();
let productController = require("../Controller/product.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "public", "media", "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safe = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) {
      cb(new Error("Only image files can be uploaded."));
      return;
    }
    cb(null, true);
  },
});

router.get("/categories", productController.categories);
router.get("/viewAll", productController.viewAll);
router.get("/viewById/:id", productController.viewById);
router.post("/addnew", requireAuth, requireAdmin, productController.addNew);
router.post("/update/:id", requireAuth, requireAdmin, productController.updateById);
router.post("/delete/:id", requireAuth, requireAdmin, productController.deleteById);
router.post("/upload", requireAuth, requireAdmin, upload.single("image"), productController.uploadImage);

module.exports = router;
