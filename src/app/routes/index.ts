import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { PostRoutes } from "../modules/Posts/posts.routes";
import { VoteRoutes } from "../modules/Votes/votes.routes";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: UserRoutes,
  },
  {
    path: "/posts",
    route: PostRoutes,
  },
  {
    path: "/votes",
    route: VoteRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
