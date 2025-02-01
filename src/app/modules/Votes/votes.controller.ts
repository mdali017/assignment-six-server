import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { VoteServices } from "./votes.service";

const createVote = catchAsync(async (req: Request, res: Response) => {
  const { userId, postId, voteType } = req.body;

  if (!userId || !postId || !voteType) {
    throw new Error("Missing required fields");
  }

  const result = await VoteServices.createVoteIntoDB({
    userId,
    postId,
    voteType,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Vote processed successfully",
    data: result,
  });
});

const getContentVotes = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;

  const result = await VoteServices.getVotesByContentId(postId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Votes retrieved successfully",
    data: result,
  });
});

const getUserVote = catchAsync(async (req: Request, res: Response) => {
  const { userId, postId } = req.params;

  const result = await VoteServices.getUserVote(userId, postId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User vote retrieved successfully",
    data: result,
  });
});

export const VoteControllers = {
  createVote,
  getContentVotes,
  getUserVote,
};
