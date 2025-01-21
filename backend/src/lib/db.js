import mongoose from "mongoose";
// import { config } from "dotenv";

// config();

// Establishing the db Connection (AtlasDB)
export const connectDB = async () => {
  try {
    // const conn = await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    // console.log(`MongoDB connected: ${conn.connection.host}`);
    console.log(`MongoDB connected ....`);
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};
