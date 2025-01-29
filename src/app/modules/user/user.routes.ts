import express from "express";
import { UserControllers } from "./user.controller";
import { SingleFileUpload } from "../../helpers/singleFileUpload";

const router = express.Router();

router.post(
  "/register",
  SingleFileUpload.singleFileUpload,
  UserControllers.createUser
);
router.post("/login", UserControllers.loginUser);
router.post("/forget-password", UserControllers.forgetPassword);
router.patch("/reset-password/:token", UserControllers.resetPassword);

export const UserRoutes = router;
