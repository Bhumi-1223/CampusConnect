const mongoose = require("mongoose");
const { CATEGORIES, PRIORITIES, STATUSES } = require("../utils/constants");

// Every status change is recorded, so admins (and students) can see the full history.
const historySchema = new mongoose.Schema(
  {
    from: { type: String, enum: [...STATUSES, null], default: null },
    to: { type: String, enum: STATUSES, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    note: { type: String, trim: true, maxlength: 300 },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const serviceRequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, minlength: 5, maxlength: 120 },
    description: { type: String, required: [true, "Description is required"], trim: true, minlength: 10, maxlength: 2000 },
    category: { type: String, enum: CATEGORIES, required: [true, "Category is required"] },
    priority: { type: String, enum: PRIORITIES, default: "Medium" },
    status: { type: String, enum: STATUSES, default: "Pending" },

    // Relationships: ObjectId references to the User collection (not plain strings).
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    adminResponse: { type: String, trim: true, maxlength: 1000, default: "" },
    location: { type: String, trim: true, maxlength: 120, default: "" },
    statusHistory: [historySchema],
  },
  { timestamps: true } // createdAt / updatedAt
);

// Indexes that make the common admin filters and the student "my requests" view fast.
serviceRequestSchema.index({ status: 1, priority: 1, category: 1 });
serviceRequestSchema.index({ createdBy: 1, createdAt: -1 });
serviceRequestSchema.index({ title: "text", description: "text" });

serviceRequestSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
