import { Types } from "mongoose";

// votes.interface.ts
export type TVoteType = 'upvote' | 'downvote';

export interface IVote {
  userId: Types.ObjectId;
  postId: Types.ObjectId;  // ID of the content being voted on (post, comment, etc)
  voteType: TVoteType;
  createdAt: Date;
  updatedAt: Date;
}