const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/error");
const { CATEGORIES, PRIORITIES, STATUSES } = require("./utils/constants");
const { TRANSITIONS } = require("./utils/workflow");

const app = express();

app.use(helmet()); // secure HTTP headers
app.use(cors()); // allow a frontend on another origin to call the API
app.use(express.json({ limit: "100kb" })); // parse JSON bodies (with a size limit)
if (process.env.NODE_ENV !== "test") app.use(morgan("dev")); // request logging

// Small index page so opening the API in a browser shows what is available.
app.get("/", (_req, res) => {
  res.json({
    name: "Campus Service Request & Issue Management API",
    version: "1.0.0",
    docs: "See README.md for the full endpoint list",
    endpoints: {
      auth: ["POST /api/auth/register", "POST /api/auth/login", "GET /api/auth/me"],
      requests: [
        "POST /api/requests",
        "GET /api/requests",
        "GET /api/requests/:id",
        "PUT /api/requests/:id",
        "DELETE /api/requests/:id",
        "PUT /api/requests/:id/status",
        "PUT /api/requests/:id/assign",
      ],
      admin: ["GET /api/admin/dashboard", "GET /api/admin/staff"],
    },
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

// Reference data that a client would use to build forms and filters.
app.get("/api/meta", (_req, res) => {
  res.json({ success: true, categories: CATEGORIES, priorities: PRIORITIES, statuses: STATUSES, workflow: TRANSITIONS });
});

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
