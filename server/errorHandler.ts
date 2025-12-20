import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { logError } from './logger';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log the error
  if (err instanceof ApiError) {
    logError(`API Error: ${err.message}`, err, {
      statusCode: err.statusCode,
      code: err.code,
      details: err.details,
    });
  } else {
    logError(`Unhandled Error: ${err.message}`, err);
  }

  // Capture in Sentry
  Sentry.captureException(err);

  // Send appropriate response
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code || 'UNKNOWN_ERROR',
        details: err.details,
      },
    });
  }

  // Handle unexpected errors
  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
    },
  });
};

// Async wrapper to catch errors in async route handlers
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error formatter
export const formatValidationError = (error: any) => {
  if (error.issues && Array.isArray(error.issues)) {
    return {
      message: 'Validation failed',
      details: error.issues.map((issue: any) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
    };
  }
  return {
    message: 'Validation failed',
  };
};
