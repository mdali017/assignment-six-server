import { Schema, model, Types } from "mongoose";
import { TUser, TUserName } from "./user.interface";
import crypto from "crypto";

const userNameSchema = new Schema<TUserName>({
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
});

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<TUser>(
  {
    name: { type: userNameSchema },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], required: true },
    address: { type: String, default: null },

    // Profile Picture
    profilePicture: {
      type: String,
      default: null, // URL to default avatar
    },

    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDate: {
      type: Date,
      default: null,
    },
    paymentDetails: {
      transactionId: { type: String },
      amount: { type: Number },
      provider: { type: String, enum: ["AAMARPAY", "STRIPE"] },
      date: { type: Date },
    },

    // Social Features
    followers: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: Types.ObjectId,
        ref: "Post", // Assuming you have a Post model
      },
    ],

    // Stats
    followerCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    postCount: {
      type: Number,
      default: 0,
    },

    // Premium Content Access
    isPremium: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  console.log(resetToken)
  console.log(this.passwordResetToken)

  return resetToken;
};

export const UserModel = model<TUser>("User", userSchema);
