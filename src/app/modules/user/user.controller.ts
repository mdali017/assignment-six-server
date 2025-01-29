import { Request, Response, NextFunction, RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";
import { UserModel } from "./user.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const userData = JSON.parse(req.body.userData);
  const file = req.file;

  const result = await UserService.createUserIntoDB(userData, file);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User created successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  // console.log({userId})
  const result = await UserService.getUserProfileFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await UserService.updateUserRoleIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User role updated successfully",
    data: result,
  });
});

const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const userData = req.body.userData
    console.log(req.body.userData)

    console.log('Parsed UserData:', userData);
    const file = req.file;

    // console.log('UserId:', userId);
    console.log('File:', file);

    const result = await UserService.updateUserProfileIntoDB(
      userId,
      userData,
      file
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User profile updated successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to update user profile",
      data: null,
    });
  }
});

const verifyUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const paymentDetails = req.body;
  const result = await UserService.verifyUserIntoDB(userId, paymentDetails);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User verified successfully",
    data: result,
  });
});

const toggleFollowUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId; // Current user
  const targetUserId = req.params.targetUserId; // User to follow/unfollow
  const result = await UserService.toggleFollowUserIntoDB(userId, targetUserId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.isFollowing
      ? "User followed successfully"
      : "User unfollowed successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.loginUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const passwordRecovery = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.passwordRecoveryIntoDB(req.body.email);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password recovery email sent successfully",
    data: result,
  });
});

const forgetPassword: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "User not found",
      data: null,
    });
  }

  const token = jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1h",
    }
  );

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MY_GMAIL,
      pass: process.env.MY_PASS,
    },
  });

  const receiver = {
    from: "mohabbatalit8@gmail.com",
    to: user.email,
    subject: "Password change request received !!",
    text: `You are receiving an email because you (or someone else) has requested the reset of the password for your account. 
    Please go to the following link to perform the reset: ${process.env.CLIENT_URL}/reset-password/${token}`,
  };

  await transporter.sendMail(receiver);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password reset link sent successfully to your email",
    data: null,
  });
});

const resetPassword: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Password is required",
      data: null,
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await UserModel.findOne({ email: decoded.email });
    if (!user) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user.password = hashedPassword;
    await user.save();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Password updated successfully",
      data: null,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Invalid or expired token",
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "An error occurred while resetting the password",
      data: null,
    });
  }
});

export const UserControllers = {
  createUser,
  getAllUsers,
  getUserProfile,
  updateUserRole,
  updateUserProfile,
  verifyUser,
  toggleFollowUser,
  loginUser,
  passwordRecovery,
  forgetPassword,
  resetPassword,
};