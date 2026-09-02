import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data
  });
}

export function sendError(res: Response, error: string, statusCode = 400, details?: any) {
  return res.status(statusCode).json({
    success: false,
    error,
    details
  });
}

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return sendError(res, 'Validation failed', 400, err.errors);
      }
      next(err);
    }
  };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return sendError(res, 'Invalid query parameters', 400, err.errors);
      }
      next(err);
    }
  };
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('API Error Handler:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, status);
}
