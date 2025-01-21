import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";


export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,                                               //also write it as fullName: fullName
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);    //When you call bcrypt.compare(password, hashedPassword): bcrypt extracts the salt from the stored hashedPassword. It hashes the provided password (from login) using the extracted salt. It then compares the newly hashed password with the stored hash

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    // res.clearCookie("jwt", { 
    //   httpOnly: true, 
    //   sameSite: "strict", 
    //   secure: process.env.NODE_ENV !== "development" 
    // });
    res.cookie("jwt", "", {                 //Update Expiry to delete cookie
      maxAge: 0, 
      httpOnly: true, 
      sameSite: "strict", 
      secure: process.env.NODE_ENV !== "development" 
    });    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const updateProfile = async (req, res) => {
//   try {
//     const { profilePic } = req.body;
//     const userId = req.user._id;

//     if (!profilePic) {
//       return res.status(400).json({ message: "Profile pic is required" });
//     }

//     const uploadResponse = await cloudinary.uploader.upload(profilePic);
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { profilePic: uploadResponse.secure_url },
//       { new: true }                                           //return new updated user object
//     );

//     res.status(200).json(updatedUser);
//   } catch (error) {
//     console.log("error in update profile:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.body.profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    // Fetch the user's name from the database
    const user = await User.findById(userId);
    // console.log(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a unique file name using the user's name and ID
    const userName = user.fullName.replace(/\s+/g, "_").toLowerCase();
    const fileName = `${userName}_${userId}_profilePic`;

    // Upload the image to Cloudinary with a custom file name and folder
    const uploadResponse = await cloudinary.uploader.upload(req.body.profilePic, {
      folder: "chatty-dev/profilePic", // Folder path
      public_id: fileName,            // File name
    });

    // Update the user's profile picture URL in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url }, // Save Cloudinary's URL to the database
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in update profile:", error.message);
    res.status(500).json({
      message: process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
    });
  }
};


export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
