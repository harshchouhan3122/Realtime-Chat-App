import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { v4 as uuidv4 } from 'uuid';

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");      //for display all users except me

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({               //extract our (2 user's) chats from the messages db
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const sendMessage = async (req, res) => {
//   try {
//     const { text, image } = req.body;
//     const { id: receiverId } = req.params;      //renaming id from params as receiverID 
//     const senderId = req.user._id;

//     let imageUrl;
//     if (image) {
//       // Upload base64 image to cloudinary
//       const uploadResponse = await cloudinary.uploader.upload(image);
//       imageUrl = uploadResponse.secure_url;
//     }

//     const newMessage = new Message({
//       senderId,
//       receiverId,
//       text,
//       image: imageUrl,
//     });

//     await newMessage.save();

//     // todo: Realtime functionality goes here => socket.io

//     const receiverSocketId = getReceiverSocketId(receiverId);   // getting its value from the onlineUsers Object from socket.js
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("newMessage", newMessage);
//     }

//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.log("Error in sendMessage controller: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;      // Renaming id from params as receiverId
    const senderId = req.user._id;

    // Fetch the user's name from the database
    const user = await User.findById(senderId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate the new file name based on the count
    const userName = user.fullName.replace(/\s+/g, "_").toLowerCase();
    const uniqueId = uuidv4();  // Generate a unique ID
    const fileName = `${userName}_${senderId}_${uniqueId}`;

    let imageUrl;
    if (image) {
      // Upload image to Cloudinary in a folder named after the sender's userId
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: `chatty-dev/messages/${userName}_${senderId}`, // Dynamic folder path based on sender's userId
        public_id: fileName,                      // Unique public_id with increasing number
      });

      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Realtime functionality (socket.io) - notify the receiver
    const receiverSocketId = getReceiverSocketId(receiverId); // getting it from the onlineUsers object
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
