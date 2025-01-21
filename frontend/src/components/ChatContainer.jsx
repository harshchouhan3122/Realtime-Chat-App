import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => { 
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,              // update chat: if the selected user sent a message to display real time
    unsubscribeFromMessages,          // If user gets offline or we select any other user to chat with
  } = useChatStore();
  
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);   // useRef is an inbuilt React Hook provided by React. It is used to create a reference to a DOM element or a mutable variable that persists across renders without triggering a re-render when it changes.


  // Dependency Change (e.g., selectedUser._id changes): React detects a dependency change. Before running the effect again: React calls the cleanup function (unsubscribeFromMessages). This removes the old listener tied to the previous selectedUser. The effect re-runs: Fetches messages for the new selectedUser. Sets up a new listener using subscribeToMessages.
  // e.g. User selects User A: subscribeToMessages is called, and a listener is added for messages from User A. User switches to User B: Without cleanup, the listener for User A remains active. A new listener for User B is added. Result: Both listeners are now active, causing: Messages for User A to still trigger updates. Potentially duplicate or incorrect UI behavior.
  useEffect(() => {
    getMessages(selectedUser._id);      // Fetches the messages for the currently selected user.

    subscribeToMessages();              // Sets up a subscription to listen for new messages in real time (e.g., via WebSocket or similar mechanism).

    return () => unsubscribeFromMessages();       // This is called when the component unmounts or when any of the dependencies change (before re-subscribing). It cleans up the previous subscription to avoid memory leaks or duplicate listeners.
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);  // whenever user changes, this useffect should run

  // use to scroll automatic effect whenever new message is sent or new message arrived
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });   
    }
  }, [messages]);

  if (isMessagesLoading) {          // frontend is fetching the messages from the backend, show skeleton till then
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {/* Main Chat Container -> Show chats between two users */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
