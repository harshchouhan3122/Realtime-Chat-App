import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";      // Different operating systems use different path delimiters.

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";          // The server enables both HTTP routes (via app) and WebSocket communication (via io) to run on the same port


// const app = express();     // we are importing it from socket.js

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

// app.use(express.json());
app.use(express.json({ limit: '5mb' }));   // increase the limit to tackle the large payload

app.use(cookieParser());
app.use(                                //By default, web browsers block cross-origin requests for security reasons unless the server explicitly allows them via CORS headers.
  cors({
    origin: "http://localhost:5173",    //It is necessary when your frontend and backend are hosted on different origins (e.g., your React app on http://localhost:5173 and your API server on http://localhost:5000).
    // origin: "*",
    credentials: true,                  //This allows the server to accept requests that include credentials like cookies, authorization headers, or TLS client certificates.
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Use of dist folder of frontend only in production
if (process.env.NODE_ENV === "production") {          //  When a user requests a static asset (like styles.css, bundle.js, etc.), Express will serve it from this dist folder.
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // request for undefined route
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// use server here to combine http and io requests and handle it on same port
server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
