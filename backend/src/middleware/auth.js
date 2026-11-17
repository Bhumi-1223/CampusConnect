const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ApiError, asyncHandler } = require("../utils/ApiError");

/**
 * protect — requires a valid JWT in the header:  Authorization: Bearer <token>
 * Missing / invalid / expired token → 401 Unauthorized.
 * On success the logged-in user is attached as req.user.
 */
const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Not authorized — please log in and send a Bearer token");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const msg = err.name === "TokenExpiredError" ? "Session expired — please log in again" : "Invalid token";
    throw new ApiError(401, msg);
  }

  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, "The user for this token no longer exists");

  req.user = user;
  next();
});

/**
 * authorize(...roles) — role check, used AFTER protect.
 * Logged in but with the wrong role → 403 Forbidden.
 */
const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Access denied — this action requires role: ${roles.join(" or ")}`));
    }
    next();
  };

module.exports = { protect, authorize };
