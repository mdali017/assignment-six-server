import { Types } from "mongoose";

export type TUserName = {
  firstName: string;
  middleName?: string;
  lastName: string;
};

export type TPaymentDetails = {
  transactionId: string;
  amount: number;
  provider: "AAMARPAY" | "STRIPE";
  date: Date;
};

export type TUser = {
  name: TUserName;
  email: string;
  password: string;
  phone: string;
  role: "admin" | "user";
  address?: string;
  
  // Profile Picture
  profilePicture?: string;

  // Verification Status
  isVerified: boolean;
  verificationDate?: Date;
  paymentDetails?: TPaymentDetails;

  // Social Features
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  posts: Types.ObjectId[];

  // Stats
  followerCount: number;
  followingCount: number;
  postCount: number;

  // Premium Content Access
  isPremium: boolean;

  // Virtual Properties
  fullName?: string;

  // password
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpires?: Date;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;

  // Methods
  verifyUser: (paymentDetails: TPaymentDetails) => Promise<void>;
  toggleFollow: (userId: Types.ObjectId) => Promise<boolean>;
};