const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is undefined. Please add it to your .env file.");
    }
    
    console.log("Attempting to connect to MongoDB Atlas...");
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected ✅: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;