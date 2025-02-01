import express from "express";
import { PostController } from "./posts.controller";
// import auth from '../../middleware/auth';
import { SingleFileUpload } from "../../helpers/singleFileUpload";
import { MultipleFileUpload } from "../../helpers/multipleFileUpload";
import auth from "../../middleware/auth";
// import { SingleFileUpload } from '../../middleware/singleFileUpload';

const router = express.Router();

// Create post with multiple images
router.post(
  "/create",
  MultipleFileUpload.multipleFileUpload,
  PostController.createPost
);

// Get all posts (filtered based on user's verification status)
router.get("/", PostController.getAllPosts);

// Get single post by ID
router.get("/:postId", PostController.getPostById);

// Update post
router.patch(
  "/:postId",
  MultipleFileUpload.multipleFileUpload,
  PostController.updatePost
);

// Delete post
router.delete("/:postId", PostController.deletePost);

// Toggle upvote on post
router.post("/:postId/upvote", PostController.toggleUpvotePost);

export const PostRoutes = router;
