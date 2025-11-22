import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User, { IUser } from '../models/User.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { AuthRequest } from '../types/index.js';
import { JwtPayload } from 'jsonwebtoken';

export const protect = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1) Getting token and check if it's there
  let token: string | undefined;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded = await (promisify(jwt.verify) as any)(token, process.env.JWT_SECRET!) as JwtPayload;

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).select('+password');
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Check if user is active
  if (!currentUser.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

export const optionalAuth = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = await (promisify(jwt.verify) as any)(token, process.env.JWT_SECRET!) as JwtPayload;
      const currentUser = await User.findById(decoded.id);
      
      if (currentUser && currentUser.isActive) {
        req.user = currentUser;
      }
    } catch (error) {
      // Token is invalid, but that's okay for optional auth
    }
  }

  next();
});