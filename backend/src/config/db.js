const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

let memoryServer = null;

/**
 * Connects Mongoose to MongoDB.
 *
 * - If MONGO_URI is set (local MongoDB or Atlas), we connect to it directly.
 * - Otherwise we start a real MongoDB server on this machine using
 *   mongodb-memory-server, storing its files in backend/.data so the data
 *   survives restarts. This means the project runs with zero setup.
 *
 * Pass { inMemory: true } (used by the tests) for a throw-away database.
 */
async function connectDB({ inMemory = false } = {}) {
  let uri = inMemory ? "" : process.env.MONGO_URI;

  if (!uri) {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const instance = {};
    if (!inMemory) {
      instance.dbPath = path.join(__dirname, "..", "..", ".data");
      instance.storageEngine = "wiredTiger";
      fs.mkdirSync(instance.dbPath, { recursive: true });
    }
    memoryServer = await MongoMemoryServer.create({ instance });
    uri = memoryServer.getUri("campus_service");
  }

  await mongoose.connect(uri);
  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = { connectDB, disconnectDB };
