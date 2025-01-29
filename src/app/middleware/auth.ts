import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserModel } from '../modules/user/user.model';

const JWT_SECRET = process.env.JWT_SECRET || "assignment_three_secret_key";

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        role: string;
        isVerified: boolean;
      };
    }
  }
}

const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: No token provided',
        error: {
          code: 401,
          description: 'Access denied. No token provided.'
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Check if user still exists
    const user = await UserModel.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: User not found',
        error: {
          code: 401,
          description: 'User no longer exists.'
        }
      });
    }

    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      isVerified: decoded.isVerified
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid token',
        error: {
          code: 401,
          description: 'Invalid token.'
        }
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Token expired',
        error: {
          code: 401,
          description: 'Token has expired.'
        }
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: {
        code: 500,
        description: 'Internal server error during authentication.'
      }
    });
  }
};

// Middleware to check if user is admin
const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin only',
        error: {
          code: 403,
          description: 'Only administrators can access this resource.'
        }
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization failed',
      error: {
        code: 500,
        description: 'Internal server error during authorization.'
      }
    });
  }
};

// Middleware to check if user is verified
const isVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Verified users only',
        error: {
          code: 403,
          description: 'This content is only accessible to verified users.'
        }
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization failed',
      error: {
        code: 500,
        description: 'Internal server error during authorization.'
      }
    });
  }
};

// Middleware to check if user is the owner of the resource
const isOwner = (resourceModel: any) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const resourceId = req.params.id || req.params.postId || req.params.userId;
    const resource = await resourceModel.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
        error: {
          code: 404,
          description: 'The requested resource does not exist.'
        }
      });
    }

    // Check if the authenticated user is the owner
    if (resource.author?.toString() !== req.user.id && 
        resource._id?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Not the owner',
        error: {
          code: 403,
          description: 'You can only modify your own resources.'
        }
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization failed',
      error: {
        code: 500,
        description: 'Internal server error during authorization.'
      }
    });
  }
};

export default auth;
export { isAdmin, isVerified, isOwner };