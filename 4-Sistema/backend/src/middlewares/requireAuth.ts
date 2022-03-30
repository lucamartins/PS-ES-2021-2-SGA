import jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors';
import { Request, Response, NextFunction } from 'express';
import { TUserJwtPayload } from '../types';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;
  if (!token) throw new UnauthenticatedError('Login is required');

  try {
    const { userAuth } = jwt.verify(token, process.env.JWT_SECRET!);
    Object.defineProperty(req, 'userId', { enumerable: true, value: (userAuth as TUserJwtPayload).id });
    Object.defineProperty(req, 'userRole', { enumerable: true, value: (userAuth as TUserJwtPayload).role });
  } catch (err) {
    throw new UnauthenticatedError('Login is required');
  }

  next();
};
