import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,             // null -> no user is selected to chat with
  isUsersLoading: false,          // for showing sidebar skeleton
  isMessagesLoading: false,       // for showing chatting skeleton

  // Get Users for the Sidebar
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Get Messages to display previous chats between the users
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    // console.log(messageData);
    const { selectedUser, messages } = get();           // get() is used within a Zustand store to access the current state of the store.
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });   // append the last message with previous one
      // console.log(messages)                      // updated messages will show in new rendering
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // update chat: if the selected user sent a message to display real time (used in ChatContainer.jsx)
  //  This function subscribes to the newMessage event from the Socket.IO server to receive messages in real-time for the currently selected user.
  subscribeToMessages: () => {        
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;    // Outside Zustand Store: useAuthStore.getState() is used to access the current state directly from the store. and  nside Zustand Store: get() is available as an argument in the Zustand store definition to access the current state.

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  // If user gets offline or we select any other user to chat with 
  // This function unsubscribes from the newMessage event to avoid receiving updates when the user goes offline or no longer needs to listen for messages.
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
