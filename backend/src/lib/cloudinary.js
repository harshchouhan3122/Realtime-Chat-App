import { v2 as cloudinary } from "cloudinary";

import { config } from "dotenv";

// import { CloudinaryStorage } from 'multer-storage-cloudinary';

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define Storage
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'chatty-dev',
//     allowedFormatsf: ["png", "jpeg", "jpg"]
//   },
// });

export default cloudinary;
// module.exports = {cloudinary , storage};
