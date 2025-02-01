import { Schema, model } from 'mongoose';
import { IVote, TVoteType } from './votes.interface';

const voteSchema = new Schema<IVote>({
  userId: {
    type: Schema.Types.ObjectId,  // Changed to ObjectId
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  postId: {
    type: Schema.Types.ObjectId,  // Changed to ObjectId
    ref: 'Post',
    required: [true, 'Post ID is required'],
  },
  voteType: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: [true, 'Vote type is required'],
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
});

// Compound index to prevent duplicate votes of same type by same user on same post
voteSchema.index({ userId: 1, postId: 1, voteType: 1 }, { unique: true });

export const VoteModel = model<IVote>('Vote', voteSchema);