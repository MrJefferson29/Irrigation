const mongoose = require("mongoose");

let connected = false;

async function connectDb() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.log("[db] MONGODB_URI not set — reminders stored in data/store.json");
    return false;
  }

  try {
    await mongoose.connect(uri);
    connected = true;
    console.log("[db] MongoDB connected");
    return true;
  } catch (error) {
    console.error("[db] MongoDB connection failed:", error.message);
    return false;
  }
}

function isDbConnected() {
  return connected && mongoose.connection.readyState === 1;
}

module.exports = { connectDb, isDbConnected };
