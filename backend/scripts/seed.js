// npm run seed — wipes the database and reloads the demo data.
require("dotenv").config();
const { connectDB, disconnectDB } = require("../src/config/db");
const { seed } = require("./seedData");

(async () => {
  await connectDB();
  const result = await seed({ reset: true });
  console.log(`🌱 Database reset: ${result.users} users, ${result.requests} requests`);
  await disconnectDB();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
