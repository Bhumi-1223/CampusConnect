const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ApiError, asyncHandler } = require("../utils/ApiError");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

const authResponse = (res, status, user, message) =>
  res.status(status).json({ success: true, message, token: signToken(user), user });

/** POST /api/auth/register — public. Always creates a student account. */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, department } = req.body;

  if (await User.exists({ email })) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({ name, email, password, department, role: "student" });
  authResponse(res, 201, user, "Registration successful");
});

/** POST /api/auth/login — public. Returns a JWT on correct credentials. */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // password has select:false on the schema, so ask for it explicitly here
  const user = await User.findOne({ email }).select("+password");

  // Same message for "no such user" and "wrong password" so attackers can't probe emails.
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  authResponse(res, 200, user, "Login successful");
});

/** GET /api/auth/me — the currently logged-in user. */
exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
