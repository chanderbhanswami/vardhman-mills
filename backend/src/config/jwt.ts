import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';

export interface JwtPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const signToken = (id: string | Types.ObjectId, role: string): string => {
  const payload = { id: id.toString(), role };
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(payload, secret, { expiresIn } as any);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
};

export const createSendToken = (
  user: any,
  statusCode: number,
  res: any
) => {
  const token = signToken(user._id, user.role);
  const cookieOptions = {
    expires: new Date(
      Date.now() + (Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};