// votes.route.ts
import express from "express";
import { VoteControllers } from "./votes.controller";

const router = express.Router();

router.post("/add-vote", VoteControllers.createVote);
router.get("/posts/:postId", VoteControllers.getContentVotes);
router.get("/user/:userId/posts/:postId", VoteControllers.getUserVote);

export const VoteRoutes = router;