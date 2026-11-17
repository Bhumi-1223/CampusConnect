const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");
const { asyncHandler } = require("../utils/ApiError");
const { STATUSES, PRIORITIES, CATEGORIES } = require("../utils/constants");

/** Turns [{ _id: "High", count: 3 }, ...] into { High: 3, ... } with zeros for missing keys. */
const toMap = (rows, keys) => Object.fromEntries(keys.map((k) => [k, rows.find((r) => r._id === k)?.count || 0]));

/**
 * GET /api/admin/dashboard  (admin)
 *
 * One MongoDB aggregation with $facet computes every statistic in a
 * single round-trip to the database.
 */
exports.dashboard = asyncHandler(async (_req, res) => {
  const [stats] = await ServiceRequest.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
        byCategory: [{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        unassigned: [
          { $match: { assignedTo: null, status: { $nin: ["Closed", "Rejected", "Resolved"] } } },
          { $count: "count" },
        ],
        // Average time from creation to the "Resolved" entry in the history (in hours)
        resolution: [
          { $unwind: "$statusHistory" },
          { $match: { "statusHistory.to": "Resolved" } },
          { $project: { hours: { $divide: [{ $subtract: ["$statusHistory.at", "$createdAt"] }, 3600000] } } },
          { $group: { _id: null, avgHours: { $avg: "$hours" } } },
        ],
      },
    },
  ]);

  const byStatus = toMap(stats.byStatus, STATUSES);
  const byPriority = toMap(stats.byPriority, PRIORITIES);
  const byCategory = toMap(stats.byCategory, CATEGORIES);

  const [students, staff] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "staff" }),
  ]);

  res.json({
    success: true,
    data: {
      totalRequests: stats.total[0]?.count || 0,
      pending: byStatus.Pending,
      inProgress: byStatus["In Progress"],
      resolved: byStatus.Resolved,
      highPriority: byPriority.High,
      unassignedOpen: stats.unassigned[0]?.count || 0,
      avgResolutionHours: stats.resolution[0] ? Number(stats.resolution[0].avgHours.toFixed(1)) : null,
      byStatus,
      byPriority,
      byCategory,
      users: { students, staff },
    },
  });
});

/** GET /api/admin/staff (admin) — list of people requests can be assigned to. */
exports.listStaff = asyncHandler(async (_req, res) => {
  const staff = await User.find({ role: { $in: ["staff", "admin"] } }).sort({ role: -1, name: 1 });
  res.json({ success: true, count: staff.length, data: staff });
});
