const router = require("express").Router();
const admin = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

// JWT required (401) and role must be admin (403).
router.use(protect, authorize("admin"));

router.get("/dashboard", admin.dashboard);
router.get("/staff", admin.listStaff);

module.exports = router;
