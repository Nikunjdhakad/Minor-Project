const mongoose = require("mongoose");
let MongoMemoryServer;
try {
  MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
} catch (e) {
  // Ignore
}

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    try {
      console.log("Attempting to connect to MongoDB...");
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      console.log("Local MongoDB not found. Starting In-Memory MongoDB...");
      if (!MongoMemoryServer) throw new Error("mongodb-memory-server not installed");
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB In-Memory Connected: ${conn.connection.host}`);
    }
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;