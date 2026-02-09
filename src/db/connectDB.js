// src/db/connectDB.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGO_URI
    );
    console.log(
      `MongoDB connected! DB host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("Mongoose Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
