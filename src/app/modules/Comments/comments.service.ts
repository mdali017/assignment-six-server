import { PostModel } from "../Posts/posts.model";
import { IComment, TCommentResponse } from "./comments.interface";
import { CommentModel } from "./comments.model";

const createCommentIntoDB = async (
  payload: IComment
): Promise<TCommentResponse> => {
  // Check if post exists
  const post = await PostModel.findById(payload.postId);
  if (!post) {
    throw new Error("Post not found");
  }

  // If it's a reply, check if parent comment exists
  if (payload.parentId) {
    const parentComment = await CommentModel.findById(payload.parentId);
    if (!parentComment) {
      throw new Error("Parent comment not found");
    }
  }

  const comment = await CommentModel.create(payload);

  const populatedComment = await CommentModel.findById(comment._id)
    .populate("userId", "name profilePicture")
    .lean();

  if (!populatedComment) {
    throw new Error("Failed to create comment");
  }

  return populatedComment as unknown as TCommentResponse;
};

const getPostCommentsFromDB = async (
  postId: string
): Promise<TCommentResponse[]> => {
  // Get all root comments (no parentId) with their replies
  const comments = await CommentModel.find({
    postId,
    parentId: null,
  })
    .populate("userId", "name profilePicture")
    .populate({
      path: "replies",
      populate: {
        path: "userId",
        select: "name profilePicture",
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  return comments as unknown as TCommentResponse[];
};

const updateCommentIntoDB = async (
  commentId: string,
  userId: string,
  content: string
): Promise<TCommentResponse> => {
  const comment = await CommentModel.findById(commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId.toString() !== userId) {
    throw new Error("You are not authorized to edit this comment");
  }

  comment.content = content;
  comment.isEdited = true;
  await comment.save();

  const updatedComment = await CommentModel.findById(commentId)
    .populate("userId", "name profilePicture")
    .lean();

  if (!updatedComment) {
    throw new Error("Failed to update comment");
  }

  return updatedComment as unknown as TCommentResponse;
};

const deleteCommentFromDB = async (
  commentId: string,
  userId: string,
  isPostOwner: boolean
): Promise<void> => {
  const comment = await CommentModel.findById(commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Check if user is comment owner or post owner
  if (comment.userId.toString() !== userId && !isPostOwner) {
    throw new Error("You are not authorized to delete this comment");
  }

  // Delete the comment and all its replies
  await CommentModel.deleteMany({
    $or: [{ _id: commentId }, { parentId: commentId }],
  });
};

export const CommentService = {
  createCommentIntoDB,
  getPostCommentsFromDB,
  updateCommentIntoDB,
  deleteCommentFromDB,
};
