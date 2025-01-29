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

// Multiple file upload handler
const multipleFileUpload = multer({ storage }).array("files", 10); // Max 10 files at a time

// Function to upload files to Cloudinary
const uploadFilesToCloudinary = async (files: any) => {
  const uploadPromises = files.map((file: any) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        file.path,
        { public_id: file.originalname },
        (error, result) => {
          fs.unlinkSync(file.path);
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);
    // Map results to a format that includes url and altText
    return results.map((result) => ({
      url: result.secure_url,
      altText: result.public_id, // Using public_id for altText
    }));
  } catch (error) {
    throw new Error("Error uploading files to Cloudinary");
  }
};

export const MultipleFileUpload = {
  multipleFileUpload,
  uploadFilesToCloudinary,
};
