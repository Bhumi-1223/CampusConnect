const { body, param, query, validationResult } = require("express-validator");
const { CATEGORIES, PRIORITIES, STATUSES } = require("../utils/constants");
const { ApiError } = require("../utils/ApiError");

/** Runs after a list of validators; turns failures into one 400 response. */
const handleValidation = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  next(new ApiError(400, "Validation failed", errors));
};

const idParam = [param("id").isMongoId().withMessage("Invalid request id"), handleValidation];

const register = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 80 }),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  body("department").optional().trim().isLength({ max: 80 }),
  // Public registration can only create students — admins/staff are created by the system.
  body("role").not().exists().withMessage("Role cannot be set during registration"),
  handleValidation,
];

const login = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidation,
];

const createRequest = [
  body("title").trim().isLength({ min: 5, max: 120 }).withMessage("Title must be 5–120 characters"),
  body("description").trim().isLength({ min: 10, max: 2000 }).withMessage("Description must be 10–2000 characters"),
  body("category").isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),
  body("location").optional().trim().isLength({ max: 120 }),
  body(["status", "priority", "assignedTo", "adminResponse", "createdBy"])
    .not()
    .exists()
    .withMessage("This field is managed by admins and cannot be set by students"),
  handleValidation,
];

const updateRequest = [
  ...idParam.slice(0, 1),
  body("title").optional().trim().isLength({ min: 5, max: 120 }).withMessage("Title must be 5–120 characters"),
  body("description").optional().trim().isLength({ min: 10, max: 2000 }).withMessage("Description must be 10–2000 characters"),
  body("category").optional().isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),
  body("location").optional().trim().isLength({ max: 120 }),
  body(["status", "priority", "assignedTo", "adminResponse", "createdBy"])
    .not()
    .exists()
    .withMessage("This field is managed by admins and cannot be changed by students"),
  body().custom((b) => ["title", "description", "category", "location"].some((k) => k in b)).withMessage("Provide at least one field to update"),
  handleValidation,
];

const changeStatus = [
  ...idParam.slice(0, 1),
  body("status").optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(", ")}`),
  body("priority").optional().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(", ")}`),
  body("adminResponse").optional().trim().isLength({ min: 2, max: 1000 }).withMessage("Response must be 2–1000 characters"),
  body("note").optional().trim().isLength({ max: 300 }),
  body().custom((b) => ["status", "priority", "adminResponse"].some((k) => k in b)).withMessage("Send at least one of: status, priority, adminResponse"),
  handleValidation,
];

const assign = [
  ...idParam.slice(0, 1),
  body("assignedTo").isMongoId().withMessage("assignedTo must be a valid user id"),
  body("note").optional().trim().isLength({ max: 300 }),
  handleValidation,
];

const listQuery = [
  query("status").optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(", ")}`),
  query("priority").optional().isIn(PRIORITIES).withMessage(`priority must be one of: ${PRIORITIES.join(", ")}`),
  query("category").optional().isIn(CATEGORIES).withMessage(`category must be one of: ${CATEGORIES.join(", ")}`),
  query("assignedTo").optional().isMongoId().withMessage("assignedTo must be a valid user id"),
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive number").toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100").toInt(),
  query("sort").optional().isIn(["newest", "oldest", "priority", "updated"]).withMessage("sort must be newest, oldest, priority or updated"),
  query("search").optional().trim().isLength({ max: 100 }),
  handleValidation,
];

module.exports = { idParam, register, login, createRequest, updateRequest, changeStatus, assign, listQuery };
