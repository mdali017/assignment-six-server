import { TUser, TPaymentDetails } from "./user.interface";
import { UserModel } from "./user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { SingleFileUpload } from "../../helpers/singleFileUpload";

const JWT_SECRET = process.env.JWT_SECRET || "assignment_three_secret_key";

// Helper function to handle file upload
// Helper function to handle file upload
const handleFileUpload = async (file: Express.Multer.File) => {
  try {
    const result = (await SingleFileUpload.uploadFileToCloudinary(file)) as {
      secure_url: string;
    };
    return result.secure_url;
  } catch (error) {
    throw new Error("Failed to upload file");
  }
};

const createUserIntoDB = async (payload: any, file?: Express.Multer.File) => {
  try {
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    if (file) {
      const profilePictureUrl = await handleFileUpload(file);
      payload.profilePicture = profilePictureUrl;
    }

    const result = await UserModel.create(payload);
    return result;
  } catch (error: any) {
    throw new Error('Failed to create user: ' + error.message);
  }
};

const getAllUsersFromDB = async () => {
  const result = await UserModel.find()
    .select("-password")
    .populate("followers", "name profilePicture isVerified")
    .populate("following", "name profilePicture isVerified");
  return result;
};

const getUserProfileFromDB = async (userId: string) => {
  const result = await UserModel.findById(userId)
    .select("-password")
    .populate("followers", "name profilePicture isVerified")
    .populate("following", "name profilePicture isVerified")
    .populate("posts");

  if (!result) {
    throw new Error("User not found");
  }

  return result;
};

const updateUserRoleIntoDB = async (
  userId: string,
  payload: { role: string }
) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    { role: payload.role },
    { new: true }
  ).select("-password");

  if (!result) {
    throw new Error("User not found");
  }

  return result;
};

const updateUserProfileIntoDB = async (
  userId: string,
  payload: any,
  file?: Express.Multer.File
) => {
  // If there's a new profile picture
  if (file) {
    payload.profilePicture = await handleFileUpload(file);
  }

  // If there's a new password, hash it
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 10);
  }

  const result = await UserModel.findByIdAndUpdate(
    userId,
    { $set: payload },
    { new: true }
  ).select("-password");

  if (!result) {
    throw new Error("User not found");
  }

  return result;
};

const verifyUserIntoDB = async (
  userId: string,
  paymentDetails: TPaymentDetails
) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user has at least 1 upvote on their posts
  // This would require interaction with your Post model
  const hasUpvotes = true; // Implement this check based on your Post model

  if (!hasUpvotes) {
    throw new Error("User needs at least 1 upvote to get verified");
  }

  await user.verifyUser(paymentDetails);
  return user;
};

const toggleFollowUserIntoDB = async (userId: string, targetUserId: string) => {
  const user = await UserModel.findById(userId);
  const targetUser = await UserModel.findById(targetUserId);

  if (!user || !targetUser) {
    throw new Error("User not found");
  }

  const isNowFollowing = await user.toggleFollow(
    new Types.ObjectId(targetUserId)
  );

  return {
    isFollowing: isNowFollowing,
    targetUser: await UserModel.findById(targetUserId).select(
      "name profilePicture isVerified followerCount"
    ),
  };
};

const loginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const user = await UserModel.findOne({ email: payload.email });

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordCorrect = await bcrypt.compare(
    payload.password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profilePicture: user.profilePicture,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      postCount: user.postCount,
    },
  };
};

const passwordRecoveryIntoDB = async (email: string) => {
  const user = await UserModel.findOne({ email });
  console.log(user);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const UserService = {
  createUserIntoDB,
  getAllUsersFromDB,
  getUserProfileFromDB,
  updateUserRoleIntoDB,
  updateUserProfileIntoDB,
  verifyUserIntoDB,
  toggleFollowUserIntoDB,
  loginUserIntoDB,
  passwordRecoveryIntoDB,
};
