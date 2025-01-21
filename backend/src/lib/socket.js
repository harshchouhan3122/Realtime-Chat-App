import { Server } from "socket.io";           // This is the server-side library used to handle WebSocket connections, manage events, and broadcast messages to connected clients.
import http from "http";                      // http from Node.js: Allows you to create an HTTP server.
import express from "express";                // express: A web framework for building APIs or serving static content.

const app = express();
const server = http.createServer(app);        // creates an HTTP server using the Express app. -> This allows the same server to handle both: 1. HTTP requests (e.g., for your REST API or serving files via Express).2. WebSocket connections via Socket.IO.
// app -> Handles HTTP requests (REST APIs, static files).
// server -> Combines HTTP and WebSocket handling.

const io = new Server(server, {               // The cors option in Socket.IO ensures only requests from the specified origin(s) are allowed. 
  cors: {                   
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId} -> userId from db and socketId is generating everytime whenever an connection is establish

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;   // socket: Represents the connection object created when a client connects to the WebSocket server.
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients in the channel 'getOnlineUsers'
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];           // remove from the array
    io.emit("getOnlineUsers", Object.keys(userSocketMap));      // send/ emit an updated object of online users
  });
});

export { io, app, server };
