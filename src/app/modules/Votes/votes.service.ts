// votes.service.ts
import { PostModel } from "../Posts/posts.model";
import { IVote, TVoteType } from "./votes.interface";
import { VoteModel } from "./votes.Model";

const createVoteIntoDB = async (payload: {
  userId: string;
  postId: string;
  voteType: TVoteType;
}) => {
  try {
    // Check if same type vote exists
    const existingVote = await VoteModel.findOne({
      userId: payload.userId,
      postId: payload.postId,
      voteType: payload.voteType,
    });

    if (existingVote) {
      // If same vote type exists, remove it (toggle functionality)
      await VoteModel.findByIdAndDelete(existingVote._id);

      // Remove vote from post's votes array and decrement count
      if (payload.voteType === 'upvote') {
        await PostModel.findByIdAndUpdate(payload.postId, {
          $pull: { votes: existingVote._id },
          $inc: { upvoteCount: -1 }
        });
      } else {
        await PostModel.findByIdAndUpdate(payload.postId, {
          $pull: { votes: existingVote._id },
          $inc: { downvoteCount: -1 }
        });
      }

      const voteStats = await getVotesByContentId(payload.postId);
      return {
        message: "Vote removed successfully",
        stats: voteStats,
      };
    }

    // Create new vote if no duplicate exists
    const result = await VoteModel.create(payload);

    // Add vote to post's votes array and increment count
    if (payload.voteType === 'upvote') {
      await PostModel.findByIdAndUpdate(payload.postId, {
        $push: { votes: result._id },
        $inc: { upvoteCount: 1 }
      });
    } else {
      await PostModel.findByIdAndUpdate(payload.postId, {
        $push: { votes: result._id },
        $inc: { downvoteCount: 1 }
      });
    }

    const voteStats = await getVotesByContentId(payload.postId);

    return {
      vote: result,
      stats: voteStats,
    };
  } catch (error: any) {
    throw new Error("Failed to create vote: " + error.message);
  }
};

const getVotesByContentId = async (postId: string) => {
  try {
    // Get vote counts directly from the post
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    return {
      upvotes: post.upvoteCount || 0,
      downvotes: post.downvoteCount || 0,
      total: (post.upvoteCount || 0) - (post.downvoteCount || 0),
    };
  } catch (error: any) {
    throw new Error("Failed to get votes: " + error.message);
  }
};

const getUserVote = async (userId: string, postId: string) => {
  try {
    const votes = await VoteModel.find({ userId, postId });
    return votes;
  } catch (error: any) {
    throw new Error("Failed to get user votes: " + error.message);
  }
};

// Add function to sync vote counts (useful for maintenance)
const syncVoteCounts = async (postId: string) => {
  try {
    const votes = await VoteModel.find({ postId });
    const upvotes = votes.filter((vote) => vote.voteType === "upvote").length;
    const downvotes = votes.filter((vote) => vote.voteType === "downvote").length;

    await PostModel.findByIdAndUpdate(postId, {
      upvoteCount: upvotes,
      downvoteCount: downvotes
    });

    return {
      upvotes,
      downvotes,
      total: upvotes - downvotes
    };
  } catch (error: any) {
    throw new Error("Failed to sync vote counts: " + error.message);
  }
};

export const VoteServices = {
  createVoteIntoDB,
  getVotesByContentId,
  getUserVote,
  syncVoteCounts
};