import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../types';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};
