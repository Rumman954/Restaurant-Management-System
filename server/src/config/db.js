const mongoose = require("mongoose");

/**
 * Cached Mongo connection for local + Vercel serverless.
 * Reuses the same connection across warm function invocations.
 */
async function connectDb() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGO_URI missing in environment variables");

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!global._mongooseConnectPromise) {
    global._mongooseConnectPromise = mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
  }

  await global._mongooseConnectPromise;
  console.log("MongoDB connected");
  return mongoose.connection;
}

module.exports = connectDb;
