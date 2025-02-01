// votes.service.ts
import { PostModel } from "../Posts/posts.model";
import { IVote, TVoteType } from "./votes.interface";
import { VoteModel } from "./votes.Model";
// import { PostModel } from "../posts/posts.model";

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

      // Remove vote from post's votes array
      await PostModel.findByIdAndUpdate(payload.postId, {
        $pull: { votes: existingVote._id },
      });

      const voteStats = await getVotesByContentId(payload.postId);
      return {
        message: "Vote removed successfully",
        stats: voteStats,
      };
    }

    // Create new vote if no duplicate exists
    const result = await VoteModel.create(payload);

    // Add vote to post's votes array
    await PostModel.findByIdAndUpdate(payload.postId, {
      $push: { votes: result._id },
    });

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
    const votes = await VoteModel.find({ postId });
    const upvotes = votes.filter((vote) => vote.voteType === "upvote").length;
    const downvotes = votes.filter(
      (vote) => vote.voteType === "downvote"
    ).length;

    return {
      upvotes,
      downvotes,
      total: upvotes - downvotes,
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

export const VoteServices = {
  createVoteIntoDB,
  getVotesByContentId,
  getUserVote,
};
