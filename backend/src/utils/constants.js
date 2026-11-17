// Shared constants so models, validators and controllers all agree on the same values.

const ROLES = ["student", "staff", "admin"];

const CATEGORIES = [
  "Computer",
  "Classroom Equipment",
  "Internet",
  "Hostel Maintenance",
  "Electrical",
  "Library",
  "Other",
];

const PRIORITIES = ["Low", "Medium", "High"];

const STATUSES = [
  "Pending",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
  "Rejected",
];

module.exports = { ROLES, CATEGORIES, PRIORITIES, STATUSES };
