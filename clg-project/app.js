require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var helmet = require("helmet");
var rateLimit = require("express-rate-limit");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var productRouter = require("./routes/product");
var testimonialRouter = require("./routes/testimonial");
var authRouter = require("./routes/auth");
var orderRouter = require("./routes/order");
var contactRouter = require("./routes/contact");

var app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.disable("x-powered-by");

const origins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(logger("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: origins, credentials: true }));
app.use("/media", express.static(path.join(__dirname, "public", "media"), { maxAge: "7d" }));
app.use(express.static(path.join(__dirname, "public")));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, message: "Too many attempts. Please wait a few minutes." },
});

app.get("/api/health", function (req, res) {
  res.json({ status: 200, message: "Agro Plantation API is running" });
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/product", productRouter);
app.use("/testimonial", testimonialRouter);
app.use("/auth/login", authLimiter);
app.use("/auth/addnew", authLimiter);
app.use("/auth/forgetpassword", authLimiter);
app.use("/auth", authRouter);
app.use("/order", orderRouter);
app.use("/contact", contactRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    status,
    message: status === 500 ? "Something went wrong." : err.message,
  });
});

module.exports = app;
