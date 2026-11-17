require("dotenv").config();

// Sensible defaults so the API runs even without a .env file.
process.env.JWT_SECRET ||= "dev-only-secret-change-me";
process.env.JWT_EXPIRES_IN ||= "1d";

const app = require("./app");
const { connectDB } = require("./config/db");
const { seedIfEmpty } = require("../scripts/seedData");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log("⏳ Connecting to MongoDB…");
    const conn = await connectDB();
    console.log(`✅ MongoDB connected: ${conn.host}:${conn.port}/${conn.name}`);

    const seeded = await seedIfEmpty();
    if (seeded) console.log(`🌱 Seeded demo data: ${seeded.users} users, ${seeded.requests} requests`);

    app.listen(PORT, () => {
      console.log(`🚀 Campus Service API running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
})();
