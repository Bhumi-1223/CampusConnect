const router = require("express").Router();
const c = require("../controllers/requestController");
const v = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");

// Every request route needs a logged-in user (JWT) → 401 otherwise.
router.use(protect);

router
  .route("/")
  .post(authorize("student"), v.createRequest, c.createRequest) // Student: create
  .get(v.listQuery, c.listRequests); // Student: own · Staff: assigned · Admin: all + filters

router
  .route("/:id")
  .get(v.idParam, c.getRequest) // Owner / assigned staff / Admin
  .put(authorize("student"), v.updateRequest, c.updateRequest) // Owner, only while Pending
  .delete(v.idParam, c.deleteRequest); // Owner (Pending) / Admin

router.put("/:id/status", authorize("admin"), v.changeStatus, c.changeStatus); // Admin
router.put("/:id/assign", authorize("admin"), v.assign, c.assignRequest); // Admin

module.exports = router;
