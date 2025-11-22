import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User, { IUser } from '../models/User.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { createSendToken } from '../config/jwt.js';
import { AuthRequest } from '../types/index.js';
import { sendEmail } from '../services/email.service.js';

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email, password, mobile } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Create new user
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    mobile
  });

  // Generate email verification token
  const verifyToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;
    
    await sendEmail({
      email: newUser.email,
      subject: 'Email Verification - Vardhman Mills',
      html: `
        <h1>Welcome to Vardhman Mills!</h1>
        <p>Hello ${newUser.firstName},</p>
        <p>Thank you for registering with us. Please click the link below to verify your email address:</p>
        <a href="${verifyURL}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; display: inline-block; border-radius: 4px;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    newUser.emailVerificationToken = undefined;
    newUser.emailVerificationExpires = undefined;
    await newUser.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Please try again later.', 500));
  }
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  // If everything ok, send token to client
  createSendToken(user, 200, res);
});

export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({ status: 'success' });
};

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send it to user's email
  try {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset - Vardhman Mills (valid for 10 min)',
      html: `
        <h1>Password Reset</h1>
        <p>Hello ${user.firstName},</p>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetURL}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; display: inline-block; border-radius: 4px;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Please try again later.', 500));
  }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Log the user in, send JWT
  createSendToken(user, 200, res);
});

export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // Update user verification status
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully!'
  });
});

export const updatePassword = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Get user from collection
  const user = await User.findById(req.user!.id).select('+password');

  // Check if POSTed current password is correct
  if (!(await user!.comparePassword(req.body.passwordCurrent))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // If so, update password
  user!.password = req.body.password;
  await user!.save();

  // Log user in, send JWT
  createSendToken(user, 200, res);
});

export const getMe = (req: AuthRequest, res: Response, next: NextFunction) => {
  req.params.id = req.user!.id;
  next();
};

// Social login handlers (to be implemented with Passport.js or similar)
export const googleAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Implementation depends on the OAuth library used
  // This is a placeholder for Google OAuth flow
  res.status(501).json({
    status: 'error',
    message: 'Google authentication not implemented yet'
  });
});

export const facebookAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Implementation depends on the OAuth library used
  // This is a placeholder for Facebook OAuth flow
  res.status(501).json({
    status: 'error',
    message: 'Facebook authentication not implemented yet'
  });
});