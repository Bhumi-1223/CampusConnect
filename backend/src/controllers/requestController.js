const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");
const { ApiError, asyncHandler } = require("../utils/ApiError");
const { canTransition, allowedNext } = require("../utils/workflow");

const POPULATE = [
  { path: "createdBy", select: "name email department role" },
  { path: "assignedTo", select: "name email department role" },
  { path: "statusHistory.changedBy", select: "name role" },
];

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  updated: { updatedAt: -1 },
};

const PRIORITY_RANK = { High: 3, Medium: 2, Low: 1 };

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Loads a request or throws 404. */
async function findRequestOr404(id) {
  const request = await ServiceRequest.findById(id);
  if (!request) throw new ApiError(404, "Service request not found");
  return request;
}

const isOwner = (request, user) => request.createdBy.toString() === user._id.toString();
const isAssignee = (request, user) => request.assignedTo && request.assignedTo.toString() === user._id.toString();

/* ------------------------------------------------------------------ */
/* POST /api/requests  (student) — create a new request               */
/* ------------------------------------------------------------------ */
exports.createRequest = asyncHandler(async (req, res) => {
  const { title, description, category, location } = req.body;

  const request = await ServiceRequest.create({
    title,
    description,
    category,
    location,
    createdBy: req.user._id,
    statusHistory: [{ from: null, to: "Pending", changedBy: req.user._id, note: "Request created" }],
  });

  await request.populate(POPULATE);
  res.status(201).json({ success: true, message: "Request submitted", data: request });
});

/* ------------------------------------------------------------------ */
/* GET /api/requests  (student / staff / admin)                       */
/*   student → only their own requests                                */
/*   staff   → only requests assigned to them                         */
/*   admin   → all requests                                           */
/*   everyone can filter: ?status=&priority=&category=&search=        */
/*   admin can also filter by ?assignedTo=  and paginate / sort       */
/* ------------------------------------------------------------------ */
exports.listRequests = asyncHandler(async (req, res) => {
  const { status, priority, category, search, assignedTo, sort = "newest" } = req.query;
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const filter = {};
  if (req.user.role === "student") filter.createdBy = req.user._id;
  if (req.user.role === "staff") filter.assignedTo = req.user._id;

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (assignedTo && req.user.role === "admin") filter.assignedTo = assignedTo;
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ title: rx }, { description: rx }, { location: rx }];
  }

  const total = await ServiceRequest.countDocuments(filter);

  let data;
  if (sort === "priority") {
    // Sort High → Medium → Low, newest first within each level.
    const all = await ServiceRequest.find(filter).populate(POPULATE).sort({ createdAt: -1 });
    all.sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
    data = all.slice((page - 1) * limit, page * limit);
  } else {
    data = await ServiceRequest.find(filter)
      .populate(POPULATE)
      .sort(SORTS[sort])
      .skip((page - 1) * limit)
      .limit(limit);
  }

  res.json({
    success: true,
    count: data.length,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    filters: { status, priority, category, search, assignedTo, sort },
    data,
  });
});

/* ------------------------------------------------------------------ */
/* GET /api/requests/:id  (owner / assigned staff / admin)            */
/* ------------------------------------------------------------------ */
exports.getRequest = asyncHandler(async (req, res) => {
  const request = await findRequestOr404(req.params.id);
  const { user } = req;

  if (user.role !== "admin" && !isOwner(request, user) && !isAssignee(request, user)) {
    throw new ApiError(403, "You can only view your own requests");
  }

  await request.populate(POPULATE);
  res.json({ success: true, data: request, allowedNextStatuses: allowedNext(request.status) });
});

/* ------------------------------------------------------------------ */
/* PUT /api/requests/:id  (owner, only while Pending)                 */
/* ------------------------------------------------------------------ */
exports.updateRequest = asyncHandler(async (req, res) => {
  const request = await findRequestOr404(req.params.id);

  if (!isOwner(request, req.user)) throw new ApiError(403, "You can only edit your own requests");
  if (request.status !== "Pending") {
    throw new ApiError(400, `This request is "${request.status}" — it can only be edited while Pending`);
  }

  for (const key of ["title", "description", "category", "location"]) {
    if (req.body[key] !== undefined) request[key] = req.body[key];
  }
  await request.save();
  await request.populate(POPULATE);
  res.json({ success: true, message: "Request updated", data: request });
});

/* ------------------------------------------------------------------ */
/* DELETE /api/requests/:id  (owner while Pending, or admin any time) */
/* ------------------------------------------------------------------ */
exports.deleteRequest = asyncHandler(async (req, res) => {
  const request = await findRequestOr404(req.params.id);
  const { user } = req;

  if (user.role !== "admin") {
    if (!isOwner(request, user)) throw new ApiError(403, "You can only delete your own requests");
    if (request.status !== "Pending") {
      throw new ApiError(400, `This request is "${request.status}" — it can only be deleted while Pending`);
    }
  }

  await request.deleteOne();
  res.json({ success: true, message: "Request deleted", id: request._id });
});

/* ------------------------------------------------------------------ */
/* PUT /api/requests/:id/status  (admin)                              */
/*   body: { status?, priority?, adminResponse?, note? }              */
/*   status changes must follow the workflow (see utils/workflow.js)  */
/* ------------------------------------------------------------------ */
exports.changeStatus = asyncHandler(async (req, res) => {
  const request = await findRequestOr404(req.params.id);
  const { status, priority, adminResponse, note } = req.body;

  if (status && status !== request.status) {
    if (!canTransition(request.status, status)) {
      const next = allowedNext(request.status);
      throw new ApiError(
        400,
        `Invalid status change: ${request.status} → ${status}. ` +
          (next.length ? `Allowed next: ${next.join(", ")}` : `"${request.status}" is a final status`)
      );
    }
    if (status === "Assigned" && !request.assignedTo) {
      throw new ApiError(400, "Assign a staff member first (PUT /api/requests/:id/assign)");
    }
    if (status === "Rejected" && !adminResponse && !request.adminResponse) {
      throw new ApiError(400, "Please include an adminResponse explaining why the request is rejected");
    }

    request.statusHistory.push({ from: request.status, to: status, changedBy: req.user._id, note });
    request.status = status;
  }

  if (priority) request.priority = priority;
  if (adminResponse) request.adminResponse = adminResponse;

  await request.save();
  await request.populate(POPULATE);
  res.json({ success: true, message: "Request updated", data: request, allowedNextStatuses: allowedNext(request.status) });
});

/* ------------------------------------------------------------------ */
/* PUT /api/requests/:id/assign  (admin)                              */
/*   body: { assignedTo: <staff or admin user id>, note? }            */
/*   Assigning an "Under Review" request moves it to "Assigned".      */
/* ------------------------------------------------------------------ */
exports.assignRequest = asyncHandler(async (req, res) => {
  const request = await findRequestOr404(req.params.id);
  const { assignedTo, note } = req.body;

  const staff = await User.findById(assignedTo);
  if (!staff) throw new ApiError(404, "Staff member not found");
  if (!["staff", "admin"].includes(staff.role)) {
    throw new ApiError(400, "Requests can only be assigned to staff or admin users");
  }

  if (!["Under Review", "Assigned", "In Progress"].includes(request.status)) {
    throw new ApiError(
      400,
      `Cannot assign a request that is "${request.status}". Move it to "Under Review" first.`
    );
  }

  request.assignedTo = staff._id;
  if (request.status === "Under Review") {
    request.statusHistory.push({
      from: "Under Review",
      to: "Assigned",
      changedBy: req.user._id,
      note: note || `Assigned to ${staff.name}`,
    });
    request.status = "Assigned";
  }

  await request.save();
  await request.populate(POPULATE);
  res.json({ success: true, message: `Request assigned to ${staff.name}`, data: request });
});
