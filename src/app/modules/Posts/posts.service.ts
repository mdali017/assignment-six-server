import { TPost } from "./posts.interface";
import { PostModel } from "./posts.model";
import { UserModel } from "../user/user.model";
import { Types } from "mongoose";
import { SingleFileUpload } from "../../helpers/singleFileUpload";

const handleImagesUpload = async (files: Express.Multer.File[]) => {
  const uploadPromises = files.map(file => SingleFileUpload.uploadFileToCloudinary(file));
  const results = await Promise.all(uploadPromises);
  return results.map((result: any) => result.secure_url);
};

const createPostIntoDB = async (payload: TPost, files?: Express.Multer.File[]) => {
  const user = await UserModel.findById(payload.author);
  if (!user) {
    throw new Error("Author not found");
  }

  // Upload images if provided
  if (files && files.length > 0) {
    const imageUrls = await handleImagesUpload(files);
    payload.images = imageUrls;
  }

  // Create post
  const newPost = await PostModel.create(payload);

  // Add post to user's posts array
  await UserModel.findByIdAndUpdate(
    payload.author,
    { $push: { posts: newPost._id } }
  );

  return newPost;
};

const getAllPostsFromDB = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // If user is verified, return all posts
  // If not, return only non-premium posts
  const query = user.isVerified ? {} : { isPremium: false };

  const posts = await PostModel.find(query)
    .populate("author", "name profilePicture isVerified")
    .sort({ createdAt: -1 });

  return posts;
};

const getPostByIdFromDB = async (postId: string, userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const post = await PostModel.findById(postId)
    .populate("author", "name profilePicture isVerified")
    .populate("upvotes", "name profilePicture");

  if (!post) {
    throw new Error("Post not found");
  }

  // Check if user can access premium content
  if (post.isPremium && !user.isVerified) {
    throw new Error("This is premium content. Please verify your account to access.");
  }

  return post;
};

const updatePostIntoDB = async (
  postId: string,
  userId: string,
  payload: Partial<TPost>,
  files?: Express.Multer.File[]
) => {
  const post = await PostModel.findById(postId);
  if (!post) {
    throw new Error("Post not found");
  }

  // Check if user is the author
  if (post.author.toString() !== userId) {
    throw new Error("You are not authorized to update this post");
  }

  // Upload new images if provided
  if (files && files.length > 0) {
    const imageUrls = await handleImagesUpload(files);
    payload.images = [...(post.images || []), ...imageUrls];
  }

  const updatedPost = await PostModel.findByIdAndUpdate(
    postId,
    { $set: payload },
    { new: true }
  ).populate("author", "name profilePicture isVerified");

  return updatedPost;
};

const deletePostFromDB = async (postId: string, userId: string) => {
  const post = await PostModel.findById(postId);
  if (!post) {
    throw new Error("Post not found");
  }

  // Check if user is the author
  if (post.author.toString() !== userId) {
    throw new Error("You are not authorized to delete this post");
  }

  // Remove post from user's posts array
  await UserModel.findByIdAndUpdate(
    userId,
    { $pull: { posts: postId } }
  );

  await PostModel.findByIdAndDelete(postId);
  return post;
};

const toggleUpvotePostInDB = async (postId: string, userId: string) => {
  const post = await PostModel.findById(postId);
  if (!post) {
    throw new Error("Post not found");
  }

  const hasUpvoted = post.upvotes.includes(new Types.ObjectId(userId));

  if (hasUpvoted) {
    post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
  } else {
    post.upvotes.push(new Types.ObjectId(userId));
  }

  await post.save();
  return post;
};

export const PostService = {
  createPostIntoDB,
  getAllPostsFromDB,
  getPostByIdFromDB,
  updatePostIntoDB,
  deletePostFromDB,
  toggleUpvotePostInDB,
};