const User = require("../src/models/User");
const ServiceRequest = require("../src/models/ServiceRequest");

/**
 * Demo data: 1 admin, 2 staff members, 4 students and 14 requests spread
 * across every status, priority and category — so filters and the
 * dashboard have something meaningful to show straight away.
 *
 * Demo passwords (local testing only):
 *   admin@campus.edu    Admin@123
 *   ravi@campus.edu     Staff@123   (staff)
 *   meena@campus.edu    Staff@123   (staff)
 *   aarav@campus.edu    Student@123 (student)  …and the other students
 */
const USERS = [
  { key: "admin", name: "Dr. Neha Kapoor", email: "admin@campus.edu", password: "Admin@123", role: "admin", department: "Administration" },
  { key: "ravi", name: "Ravi Kumar", email: "ravi@campus.edu", password: "Staff@123", role: "staff", department: "IT Services" },
  { key: "meena", name: "Meena Rao", email: "meena@campus.edu", password: "Staff@123", role: "staff", department: "Estate & Maintenance" },
  { key: "aarav", name: "Aarav Sharma", email: "aarav@campus.edu", password: "Student@123", role: "student", department: "Computer Science" },
  { key: "priya", name: "Priya Patel", email: "priya@campus.edu", password: "Student@123", role: "student", department: "Information Technology" },
  { key: "rohan", name: "Rohan Verma", email: "rohan@campus.edu", password: "Student@123", role: "student", department: "Electronics" },
  { key: "sneha", name: "Sneha Iyer", email: "sneha@campus.edu", password: "Student@123", role: "student", department: "Computer Science" },
];

// path = statuses the request has gone through after Pending
const REQUESTS = [
  { by: "aarav", title: "Lab 204 PC not booting", description: "Computer number 12 in Lab 204 shows a blue screen on startup and restarts in a loop.", category: "Computer", priority: "High", location: "Lab 204", path: [] },
  { by: "priya", title: "Wi-Fi down in Library 2nd floor", description: "The CAMPUS-WIFI network keeps disconnecting every few minutes on the second floor of the library.", category: "Internet", priority: "High", location: "Central Library", path: ["Under Review"] },
  { by: "rohan", title: "Projector flickering in Room 305", description: "The ceiling projector in Room 305 flickers constantly, making slides unreadable during lectures.", category: "Classroom Equipment", priority: "Medium", location: "Room 305", path: ["Under Review", "Assigned"], assign: "ravi" },
  { by: "sneha", title: "Hostel B bathroom tap leaking", description: "The tap in the 3rd floor common bathroom of Hostel B has been leaking for two days and floods the floor.", category: "Hostel Maintenance", priority: "Medium", location: "Hostel B, Floor 3", path: ["Under Review", "Assigned", "In Progress"], assign: "meena" },
  { by: "aarav", title: "Sparking switchboard in corridor", description: "The switchboard near Room 112 sparks when the lights are switched on. This looks dangerous.", category: "Electrical", priority: "High", location: "Block A, near Room 112", path: ["Under Review", "Assigned", "In Progress"], assign: "meena" },
  { by: "priya", title: "Library book scanner not working", description: "The self-checkout scanner at the library entrance does not read book barcodes at all.", category: "Library", priority: "Low", location: "Central Library", path: ["Under Review", "Assigned", "In Progress", "Resolved"], assign: "ravi", response: "Scanner driver reinstalled and calibrated. Working normally now." },
  { by: "rohan", title: "Slow internet in Hostel C", description: "Internet speed in Hostel C drops below 1 Mbps every evening, making online classes impossible.", category: "Internet", priority: "Medium", location: "Hostel C", path: ["Under Review", "Assigned", "In Progress", "Resolved", "Closed"], assign: "ravi", response: "Access point upgraded on all floors of Hostel C." },
  { by: "sneha", title: "Request for extra chairs", description: "Our club needs 20 extra chairs for the weekend event in the seminar hall.", category: "Other", priority: "Low", location: "Seminar Hall", path: ["Rejected"], response: "Furniture for events must be booked through the Student Affairs office, not the service desk." },
  { by: "aarav", title: "Smartboard pen missing in Room 101", description: "The stylus pen for the smartboard in Room 101 is missing, so teachers cannot write on the board.", category: "Classroom Equipment", priority: "Low", location: "Room 101", path: [] },
  { by: "priya", title: "Printer jam in CS department", description: "The shared printer in the CS department office jams on every second page.", category: "Computer", priority: "Medium", location: "CS Department Office", path: ["Under Review"] },
  { by: "rohan", title: "Ceiling fan not working", description: "The ceiling fan in Hostel A room 214 stopped working completely, it is very hot at night.", category: "Hostel Maintenance", priority: "High", location: "Hostel A, Room 214", path: ["Under Review", "Assigned"], assign: "meena" },
  { by: "sneha", title: "Power outage in Lab 210", description: "Half of the sockets in Lab 210 have no power since the morning, so we cannot use the computers.", category: "Electrical", priority: "High", location: "Lab 210", path: [] },
  { by: "aarav", title: "Library wifi login page not loading", description: "The captive portal login page does not open on phones inside the library reading room.", category: "Internet", priority: "Medium", location: "Library Reading Room", path: ["Under Review", "Assigned", "In Progress", "Resolved"], assign: "ravi", response: "Portal certificate renewed — the login page now loads on all devices." },
  { by: "priya", title: "Broken bench in Room 210", description: "A bench in the third row of Room 210 is broken and unsafe to sit on.", category: "Classroom Equipment", priority: "Low", location: "Room 210", path: ["Under Review", "Assigned", "In Progress", "Resolved", "Closed"], assign: "meena", response: "Bench replaced." },
];

const HOUR = 3600000;

async function seed({ reset = false } = {}) {
  if (reset) {
    await ServiceRequest.deleteMany({});
    await User.deleteMany({});
  }

  const users = {};
  for (const u of USERS) {
    const { key, ...data } = u;
    users[key] = await User.create(data); // create() runs the bcrypt pre-save hook
  }

  const now = Date.now();
  let i = 0;
  for (const r of REQUESTS) {
    i += 1;
    const createdAt = new Date(now - (REQUESTS.length - i + 1) * 26 * HOUR);
    const history = [{ from: null, to: "Pending", changedBy: users[r.by]._id, note: "Request created", at: createdAt }];
    let prev = "Pending";
    r.path.forEach((status, step) => {
      history.push({
        from: prev,
        to: status,
        changedBy: users.admin._id,
        note: status === "Assigned" ? `Assigned to ${users[r.assign].name}` : undefined,
        at: new Date(createdAt.getTime() + (step + 1) * 5 * HOUR),
      });
      prev = status;
    });

    const doc = new ServiceRequest({
      title: r.title,
      description: r.description,
      category: r.category,
      priority: r.priority,
      location: r.location,
      status: prev,
      createdBy: users[r.by]._id,
      assignedTo: r.assign && r.path.includes("Assigned") ? users[r.assign]._id : null,
      adminResponse: r.response || "",
      statusHistory: history,
    });
    doc.createdAt = createdAt;
    doc.updatedAt = history[history.length - 1].at;
    await doc.save({ timestamps: false });
  }

  return { users: USERS.length, requests: REQUESTS.length };
}

/** Seeds only when the database has no users yet (used on server start). */
async function seedIfEmpty() {
  if (await User.estimatedDocumentCount()) return null;
  return seed();
}

module.exports = { seed, seedIfEmpty, USERS };
