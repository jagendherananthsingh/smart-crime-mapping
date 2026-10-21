import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[Error Middleware]', err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    sendError(res, `Duplicate value for ${field}. Must be unique.`, 409);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    sendError(res, 'Database validation error', 400, errors);
    return;
  }

  // Multer file upload error
  if (err.name === 'MulterError') {
    sendError(res, `File upload error: ${err.message}`, 400);
    return;
  }

  // Generic message in production, error message in development
  const message = err.message || 'Internal server error';
  sendError(res, message, err.statusCode || 500, env.NODE_ENV === 'development' ? [err.stack] : []);
};
