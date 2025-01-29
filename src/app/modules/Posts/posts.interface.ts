import { Types } from "mongoose";

export type TPostCategory = 
  | "Adventure" 
  | "Business Travel" 
  | "Exploration" 
  | "Cultural" 
  | "Budget Travel" 
  | "Luxury Travel" 
  | "Food & Travel" 
  | "Solo Travel";

export type TPost = {
  title: string;
  content: string; // Rich text or Markdown content
  author: Types.ObjectId;
  images: string[]; // Array of image URLs
  category: TPostCategory;
  isPremium: boolean;
  upvotes: Types.ObjectId[]; // Array of user IDs who upvoted
  upvoteCount: number;
  createdAt?: Date;
  updatedAt?: Date;
};