// comments.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CommentService } from './comments.service';
import { PostModel } from '../Posts/posts.model';
// import { PostModel } from '../posts/posts.model';

const createComment = catchAsync(async (req: Request, res: Response) => {
  const { content, postId, parentId } = req.body;
  const userId: any = req.user; // Assuming you have authentication middleware

  const result = await CommentService.createCommentIntoDB({
    content,
    postId,
    userId,
    parentId: parentId || null,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Comment created successfully',
    data: result,
  });
});

const getPostComments = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;

  const result = await CommentService.getPostCommentsFromDB(postId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comments retrieved successfully',
    data: result,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId: any = req.user;

  const result = await CommentService.updateCommentIntoDB(
    commentId,
    userId,
    content,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comment updated successfully',
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const userId: any = req.user;

  // Check if user is post owner
  const comment: any = await CommentService.getPostCommentsFromDB(commentId);
  const post: any = await PostModel.findById(comment.postId);
  const isPostOwner = post?.author.toString() === userId;

  await CommentService.deleteCommentFromDB(commentId, userId, isPostOwner);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comment deleted successfully',
    data: null,
  });
});

export const CommentController = {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
};