import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PostService } from "./posts.service";

const createPost = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body);
  // Parse if string, otherwise use as is
  const postData =
    typeof req.body.postData === "string"
      ? JSON.parse(req.body.postData)
      : req.body.postData;

  const files = req.files as Express.Multer.File[];

  const result = await PostService.createPostIntoDB(postData, files);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Post created successfully",
    data: result,
  });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.getAllPostsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Posts retrieved successfully",
    data: result,
  });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  const result = await PostService.getPostByIdFromDB(postId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Post retrieved successfully",
    data: result,
  });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  const updateData = JSON.parse(req.body.postData);
  const files = req.files as Express.Multer.File[];

  const result = await PostService.updatePostIntoDB(
    postId,
    userId,
    updateData,
    files
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Post updated successfully",
    data: result,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  const result = await PostService.deletePostFromDB(postId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Post deleted successfully",
    data: result,
  });
});

const toggleUpvotePost = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  const result = await PostService.toggleUpvotePostInDB(postId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Post upvote toggled successfully",
    data: result,
  });
});

export const PostController = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleUpvotePost,
};
