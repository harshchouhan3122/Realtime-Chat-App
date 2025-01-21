// This file is used to create dummy users in db
// Free API for random users -> https://randomuser.me/

import dotenv from "../dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";


// Load the .env file from the backend folder
dotenv.config({ path: './.env' });
console.log(process.env.MONGODB_URI);

// Seed users to insert into DB
const seedUsers = [
  // Female Users (Indian)
  {
    email: "ananya.sharma@example.com",
    fullName: "Ananya Sharma",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    email: "prachi.kumar@example.com",
    fullName: "Prachi Kumar",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    email: "sanya.singh@example.com",
    fullName: "Sanya Singh",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    email: "diya.mehra@example.com",
    fullName: "Diya Mehra",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    email: "shruti.jain@example.com",
    fullName: "Shruti Jain",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/5.jpg",
  },
  {
    email: "nisha.gupta@example.com",
    fullName: "Nisha Gupta",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/6.jpg",
  },
  {
    email: "neha.patel@example.com",
    fullName: "Neha Patel",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/7.jpg",
  },
  {
    email: "isha.reddy@example.com",
    fullName: "Isha Reddy",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/8.jpg",
  },

  // Male Users (Indian)
  {
    email: "arjun.mehra@example.com",
    fullName: "Arjun Mehra",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    email: "vikram.sharma@example.com",
    fullName: "Vikram Sharma",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    email: "rohit.singh@example.com",
    fullName: "Rohit Singh",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    email: "aditya.kumar@example.com",
    fullName: "Aditya Kumar",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    email: "manish.patel@example.com",
    fullName: "Manish Patel",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    email: "rajiv.mishra@example.com",
    fullName: "Rajiv Mishra",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/6.jpg",
  },
  {
    email: "sandeep.kapoor@example.com",
    fullName: "Sandeep Kapoor",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/7.jpg",
  },
];

// Seed database function
const seedDatabase = async () => {
  try {
    const res = await connectDB();  // Ensure connection is established first
    console.log("MongoDB Connected: ", res.connection.name);  // Log the connected database name

    // Delete all existing users (Optional: In case you want to reset)
    await User.deleteMany();
    console.log("Existing users deleted");

    // Insert new users
    await User.insertMany(seedUsers);
    console.log("Database seeded successfully");

  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();
