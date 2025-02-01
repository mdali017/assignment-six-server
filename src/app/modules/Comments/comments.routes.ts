// comments.route.ts
import express from "express";
import { CommentController } from "./comments.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();

router.post("/create", CommentController.createComment);
router.get("/post/:postId", CommentController.getPostComments);
router.patch("/:commentId", CommentController.updateComment);
router.delete("/:commentId", CommentController.deleteComment);

export const CommentRoutes = router;
