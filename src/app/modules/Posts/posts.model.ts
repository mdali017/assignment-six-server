import { Schema, model } from "mongoose";
import { TPost, TPostCategory } from "./posts.interface";

const postCategories: TPostCategory[] = [
  "Adventure",
  "Business Travel",
  "Exploration",
  "Cultural",
  "Food & Travel",
  "Solo Travel"
];

const postSchema = new Schema<TPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: [{
      type: String,
    }],
    category: {
      type: String,
      enum: postCategories,
      required: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    upvotes: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    upvoteCount: {
      type: Number,
      default: 0,
    },
    votes: [{
      type: Schema.Types.ObjectId,
      ref: "Vote",
    }],
    
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

// Middleware to update upvote count
postSchema.pre("save", function (next) {
  if (this.isModified("upvotes")) {
    this.upvoteCount = this.upvotes.length;
  }
  next();
});

export const PostModel = model<TPost>("Post", postSchema);