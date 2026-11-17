const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../utils/constants");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // creates a unique index — duplicate emails are refused by MongoDB
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    // select:false → the hash is never returned by queries unless explicitly asked for
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLES, default: "student" },
    department: { type: String, trim: true, default: "General" },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Hash the password with bcrypt whenever it is created or changed.
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

// Never leak the password hash when a user is sent as JSON.
userSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
