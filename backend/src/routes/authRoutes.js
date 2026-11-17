const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const auth = require("../controllers/authController");
const v = require("../middleware/validate");
const { protect } = require("../middleware/auth");

// Slow down password guessing: max 20 login/register attempts per 15 minutes per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: { success: false, message: "Too many attempts — please try again in a few minutes" },
});

router.post("/register", authLimiter, v.register, auth.register);
router.post("/login", authLimiter, v.login, auth.login);
router.get("/me", protect, auth.me);

module.exports = router;
