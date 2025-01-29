import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { PostRoutes } from "../modules/Posts/posts.routes";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
