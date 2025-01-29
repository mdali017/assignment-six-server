// singleFileUpload.js
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary configuration
cloudinary.config({
  cloud_name: "duthiv22y",
  api_key: "939611967734855",
  api_secret: "c6Hlb1Q7Z0hjoG_aX7TyImhfMV4",
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Single file upload handler
const singleFileUpload = multer({ storage }).single("file");

// Function to upload file to Cloudinary
const uploadFileToCloudinary = async (file: any) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      { public_id: file.originalname },
      (error, result) => {
        // Remove the file from the local system after upload
        fs.unlinkSync(file.path);
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

export const SingleFileUpload = {
  singleFileUpload,
  uploadFileToCloudinary,
};
