/**
 * End-to-end API tests — run with:  npm test
 *
 * Each test talks to the real Express app over HTTP (supertest) and a real,
 * throw-away MongoDB, covering every requirement in the assessment brief.
 */
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

const { test, before, after, describe } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../src/app");
const { connectDB, disconnectDB } = require("../src/config/db");
const { seed } = require("../scripts/seedData");
const User = require("../src/models/User");

const api = () => request(app);
const tokens = {};
let ravi; // a staff member
let myRequestId; // created by the new student during the tests

async function login(email, password) {
  const res = await api().post("/api/auth/login").send({ email, password });
  assert.equal(res.status, 200, res.body.message);
  return res.body.token;
}
const auth = (who) => ({ Authorization: `Bearer ${tokens[who]}` });

before(async () => {
  await connectDB({ inMemory: true });
  await seed({ reset: true });
  tokens.admin = await login("admin@campus.edu", "Admin@123");
  tokens.aarav = await login("aarav@campus.edu", "Student@123");
  tokens.ravi = await login("ravi@campus.edu", "Staff@123");
  ravi = await User.findOne({ email: "ravi@campus.edu" });
});

after(disconnectDB);

describe("Authentication", () => {
  test("registers a new student and hashes the password", async () => {
    const res = await api()
      .post("/api/auth/register")
      .send({ name: "Test Student", email: "Test.Student@campus.edu", password: "secret123", department: "CSE" });
    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, "student");
    assert.equal(res.body.user.password, undefined, "password must never be returned");

    const stored = await User.findOne({ email: "test.student@campus.edu" }).select("+password");
    assert.match(stored.password, /^\$2[aby]\$/, "password is stored as a bcrypt hash");
    tokens.test = res.body.token;
  });

  test("rejects duplicate email with 409", async () => {
    const res = await api().post("/api/auth/register").send({ name: "Dup", email: "test.student@campus.edu", password: "secret123" });
    assert.equal(res.status, 409);
  });

  test("rejects invalid registration input with 400 and field errors", async () => {
    const res = await api().post("/api/auth/register").send({ name: "", email: "not-an-email", password: "123" });
    assert.equal(res.status, 400);
    const fields = res.body.errors.map((e) => e.field);
    assert.ok(fields.includes("name") && fields.includes("email") && fields.includes("password"));
  });

  test("does not allow choosing the admin role at registration", async () => {
    const res = await api().post("/api/auth/register").send({ name: "Hacker", email: "h@campus.edu", password: "secret123", role: "admin" });
    assert.equal(res.status, 400);
  });

  test("rejects wrong password with 401", async () => {
    const res = await api().post("/api/auth/login").send({ email: "admin@campus.edu", password: "wrong999" });
    assert.equal(res.status, 401);
  });

  test("protected routes return 401 without a token or with a bad token", async () => {
    assert.equal((await api().get("/api/requests")).status, 401);
    assert.equal((await api().get("/api/requests").set("Authorization", "Bearer abc.def.ghi")).status, 401);
  });
});

describe("Student requests (CRUD)", () => {
  test("student creates a request — starts as Pending", async () => {
    const res = await api()
      .post("/api/requests")
      .set(auth("test"))
      .send({ title: "Lab PC keyboard broken", description: "Several keys on PC 7 in Lab 101 do not respond.", category: "Computer", location: "Lab 101" });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.status, "Pending");
    assert.equal(res.body.data.createdBy.email, "test.student@campus.edu", "createdBy is populated from the User ref");
    myRequestId = res.body.data._id;
  });

  test("validates request input", async () => {
    const res = await api().post("/api/requests").set(auth("test")).send({ title: "Hi", description: "short", category: "Food" });
    assert.equal(res.status, 400);
    assert.equal(res.body.errors.length, 3);
  });

  test("students cannot set status/priority themselves", async () => {
    const res = await api()
      .post("/api/requests")
      .set(auth("test"))
      .send({ title: "Fan broken in room", description: "The ceiling fan does not turn on at all.", category: "Hostel Maintenance", status: "Closed", priority: "High" });
    assert.equal(res.status, 400);
  });

  test("admins cannot create requests (403)", async () => {
    const res = await api().post("/api/requests").set(auth("admin")).send({ title: "Admin request", description: "Admins should not create these.", category: "Other" });
    assert.equal(res.status, 403);
  });

  test("student sees ONLY their own requests", async () => {
    const res = await api().get("/api/requests").set(auth("test"));
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 1);
    assert.ok(res.body.data.every((r) => r.createdBy.email === "test.student@campus.edu"));
  });

  test("another student gets 403 on someone else's request", async () => {
    const res = await api().get(`/api/requests/${myRequestId}`).set(auth("aarav"));
    assert.equal(res.status, 403);
  });

  test("missing request returns 404, malformed id returns 400", async () => {
    assert.equal((await api().get("/api/requests/64b000000000000000000000").set(auth("admin"))).status, 404);
    assert.equal((await api().get("/api/requests/not-an-id").set(auth("admin"))).status, 400);
  });

  test("owner can update while Pending", async () => {
    const res = await api().put(`/api/requests/${myRequestId}`).set(auth("test")).send({ description: "Keys Q, W and E on PC 7 in Lab 101 do not respond." });
    assert.equal(res.status, 200);
    assert.match(res.body.data.description, /Q, W and E/);
  });

  test("non-owner cannot update (403)", async () => {
    const res = await api().put(`/api/requests/${myRequestId}`).set(auth("aarav")).send({ title: "Changed by someone else" });
    assert.equal(res.status, 403);
  });
});

describe("Status workflow (admin)", () => {
  test("students cannot change status (403)", async () => {
    const res = await api().put(`/api/requests/${myRequestId}/status`).set(auth("test")).send({ status: "Under Review" });
    assert.equal(res.status, 403);
  });

  test("rejects an invalid jump: Pending → Closed", async () => {
    const res = await api().put(`/api/requests/${myRequestId}/status`).set(auth("admin")).send({ status: "Closed" });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /Invalid status change: Pending → Closed/);
  });

  test("Pending → Under Review with priority", async () => {
    const res = await api().put(`/api/requests/${myRequestId}/status`).set(auth("admin")).send({ status: "Under Review", priority: "High" });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, "Under Review");
    assert.equal(res.body.data.priority, "High");
    assert.deepEqual(res.body.allowedNextStatuses, ["Assigned", "Rejected"]);
  });

  test("owner can no longer edit or delete once it is not Pending", async () => {
    assert.equal((await api().put(`/api/requests/${myRequestId}`).set(auth("test")).send({ title: "Too late edit" })).status, 400);
    assert.equal((await api().delete(`/api/requests/${myRequestId}`).set(auth("test"))).status, 400);
  });

  test("cannot move to Assigned without assigning someone", async () => {
    const res = await api().put(`/api/requests/${myRequestId}/status`).set(auth("admin")).send({ status: "Assigned" });
    assert.equal(res.status, 400);
  });

  test("cannot assign to a student", async () => {
    const student = await User.findOne({ email: "aarav@campus.edu" });
    const res = await api().put(`/api/requests/${myRequestId}/assign`).set(auth("admin")).send({ assignedTo: student._id });
    assert.equal(res.status, 400);
  });

  test("assign to staff moves Under Review → Assigned", async () => {
    const res = await api().put(`/api/requests/${myRequestId}/assign`).set(auth("admin")).send({ assignedTo: ravi._id });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, "Assigned");
    assert.equal(res.body.data.assignedTo.email, "ravi@campus.edu");
  });

  test("assigned staff member can see the request", async () => {
    const res = await api().get(`/api/requests/${myRequestId}`).set(auth("ravi"));
    assert.equal(res.status, 200);
  });

  test("walks the full workflow and records every step in statusHistory", async () => {
    for (const status of ["In Progress", "Resolved"]) {
      const res = await api().put(`/api/requests/${myRequestId}/status`).set(auth("admin")).send({ status });
      assert.equal(res.status, 200);
    }
    const res = await api()
      .put(`/api/requests/${myRequestId}/status`)
      .set(auth("admin"))
      .send({ status: "Closed", adminResponse: "Keyboard replaced — thanks for reporting!" });
    assert.equal(res.status, 200);
    const steps = res.body.data.statusHistory.map((h) => h.to);
    assert.deepEqual(steps, ["Pending", "Under Review", "Assigned", "In Progress", "Resolved", "Closed"]);
  });

  test("Closed is final", async () => {
    const res = await api().put(`/api/requests/${myRequestId}/status`).set(auth("admin")).send({ status: "In Progress" });
    assert.equal(res.status, 400);
  });

  test("student can read the admin response", async () => {
    const res = await api().get(`/api/requests/${myRequestId}`).set(auth("test"));
    assert.equal(res.body.data.adminResponse, "Keyboard replaced — thanks for reporting!");
  });

  test("rejecting requires a reason", async () => {
    const list = await api().get("/api/requests?status=Pending").set(auth("admin"));
    const id = list.body.data[0]._id;
    assert.equal((await api().put(`/api/requests/${id}/status`).set(auth("admin")).send({ status: "Rejected" })).status, 400);
    const ok = await api().put(`/api/requests/${id}/status`).set(auth("admin")).send({ status: "Rejected", adminResponse: "Duplicate of an existing ticket." });
    assert.equal(ok.status, 200);
  });
});

describe("Admin search, filters and dashboard", () => {
  test("admin sees all requests", async () => {
    const res = await api().get("/api/requests?limit=100").set(auth("admin"));
    assert.equal(res.body.total, 15);
  });

  test("filters by status, priority and category", async () => {
    const res = await api().get("/api/requests?priority=High&category=Electrical").set(auth("admin"));
    assert.ok(res.body.total >= 1);
    assert.ok(res.body.data.every((r) => r.priority === "High" && r.category === "Electrical"));
  });

  test("searches title/description (case-insensitive)", async () => {
    const res = await api().get("/api/requests?search=WI-FI").set(auth("admin"));
    assert.ok(res.body.total >= 1);
    assert.ok(res.body.data.every((r) => /wi-fi/i.test(r.title + r.description + r.location)));
  });

  test("invalid filter values are rejected", async () => {
    const res = await api().get("/api/requests?status=Done").set(auth("admin"));
    assert.equal(res.status, 400);
  });

  test("dashboard returns aggregated statistics", async () => {
    const res = await api().get("/api/admin/dashboard").set(auth("admin"));
    assert.equal(res.status, 200);
    const d = res.body.data;
    for (const k of ["totalRequests", "pending", "inProgress", "resolved", "highPriority", "byCategory"]) assert.ok(k in d, k);
    assert.equal(d.totalRequests, 15);
    assert.equal(Object.values(d.byStatus).reduce((a, b) => a + b, 0), d.totalRequests);
  });

  test("dashboard is admin-only (403 for students and staff)", async () => {
    assert.equal((await api().get("/api/admin/dashboard").set(auth("aarav"))).status, 403);
    assert.equal((await api().get("/api/admin/dashboard").set(auth("ravi"))).status, 403);
  });

  test("admin can delete any request; it is then 404", async () => {
    const res = await api().delete(`/api/requests/${myRequestId}`).set(auth("admin"));
    assert.equal(res.status, 200);
    assert.equal((await api().get(`/api/requests/${myRequestId}`).set(auth("admin"))).status, 404);
  });
});
