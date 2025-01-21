import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";                //for flashing messages/ notification
import { io } from "socket.io-client";              // This is the client-side library used to connect to the Socket.IO server, listen for events, and send data

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],            
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");     //axios file is made from where we are sending request to backend server with cookies credentials

      set({ authUser: res.data });
      get().connectSocket();                                  // if the user is authenticated then it must be online
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);     //message recieved from the backend
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      // console.log(res.data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();                         // get() accesses the current state of the Zustand store.
    if (!authUser || get().socket?.connected) return;   // If there's already an active socket connection (socket?.connected), exit to prevent creating duplicate connections. or if user is not authenticated then don't create a connection
                                                        // The difference between get().socket?.connected and get().socket.connected lies in the way optional chaining is used to prevent errors in case the socket object does not exist.

    const socket = io(BASE_URL, {         // The server's WebSocket endpoint (e.g., http://localhost:5001)
      query: {
        userId: authUser._id,             // Attaches the user's ID (authUser._id) to the WebSocket handshake query. This helps the server identify the user when the connection is established.
      },
      reconnection: true,                 // Automatically reconnect
      reconnectionAttempts: 5,            // Retry up to 5 times
      reconnectionDelay: 1000,            // 1-second delay between attempts
    });
    socket.connect();                     // This explicitly establishes the WebSocket connection (useful if the connection isn't automatically triggered).

    set({ socket: socket });              // Saves the socket instance in the Zustand store so it can be accessed elsewhere in the application (e.g., for sending messages or disconnecting).

    socket.on("getOnlineUsers", (userIds) => {        // The server emits the getOnlineUsers event to all connected clients whenever the list of online users changes.
      set({ onlineUsers: userIds });                  // Updates the application's state (in a Zustand store, for instance) by setting the onlineUsers property to the list of user IDs received from the server.
    });   
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();   // The if (get().socket?.connected) condition ensures that the function only attempts to disconnect the socket if: The socket object exists in the state. The socket is currently connected to the server.
  },

}));
