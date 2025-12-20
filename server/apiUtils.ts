import { Request, Response } from 'express';

// ============ ERROR CODES ============
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RATE_LIMITED: 'RATE_LIMITED',
  DB_TIMEOUT: 'DB_TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// ============ STRUCTURED ERROR RESPONSE ============
export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: object;
}

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: object
): ApiError {
  return { code, message, ...(details && { details }) };
}

export function sendError(
  res: Response,
  statusCode: number,
  code: ErrorCode,
  message: string,
  details?: object
): void {
  res.status(statusCode).json(createErrorResponse(code, message, details));
}

export function validationError(res: Response, message: string, details?: object): void {
  sendError(res, 400, ErrorCodes.VALIDATION_ERROR, message, details);
}

export function notFoundError(res: Response, message: string = 'Resource not found'): void {
  sendError(res, 404, ErrorCodes.NOT_FOUND, message);
}

export function duplicateEntryError(res: Response, message: string, details?: object): void {
  sendError(res, 409, ErrorCodes.DUPLICATE_ENTRY, message, details);
}

export function rateLimitedError(res: Response, message: string = 'Too many requests'): void {
  sendError(res, 429, ErrorCodes.RATE_LIMITED, message);
}

export function dbTimeoutError(res: Response, message: string = 'Database query timed out'): void {
  sendError(res, 504, ErrorCodes.DB_TIMEOUT, message);
}

export function internalError(res: Response, message: string = 'Internal server error'): void {
  sendError(res, 500, ErrorCodes.INTERNAL_ERROR, message);
}

// ============ PAGINATION ============
export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePaginationParams(req: Request): PaginationParams {
  const limitParam = req.query.limit;
  const offsetParam = req.query.offset;

  let limit = DEFAULT_LIMIT;
  if (limitParam !== undefined) {
    const parsed = parseInt(String(limitParam), 10);
    if (!isNaN(parsed) && parsed > 0) {
      limit = Math.min(parsed, MAX_LIMIT);
    }
  }

  let offset = 0;
  if (offsetParam !== undefined) {
    const parsed = parseInt(String(offsetParam), 10);
    if (!isNaN(parsed) && parsed >= 0) {
      offset = parsed;
    }
  }

  return { limit, offset };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      limit: params.limit,
      offset: params.offset,
      total,
      hasMore: params.offset + data.length < total,
    },
  };
}

// ============ DB QUERY TIMEOUT ============
const DEFAULT_DB_TIMEOUT = 5000;

export class DbTimeoutError extends Error {
  constructor(message: string = 'Database query timed out') {
    super(message);
    this.name = 'DbTimeoutError';
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_DB_TIMEOUT
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new DbTimeoutError(`Query timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

export function isDbTimeoutError(error: unknown): error is DbTimeoutError {
  return error instanceof DbTimeoutError;
}

// ============ HELPER FOR CATCHING AND RESPONDING TO ERRORS ============
export async function handleDbOperation<T>(
  res: Response,
  operation: () => Promise<T>,
  errorMessage: string = 'Database operation failed'
): Promise<T | null> {
  try {
    return await withTimeout(operation());
  } catch (error) {
    console.error(errorMessage, error);
    if (isDbTimeoutError(error)) {
      dbTimeoutError(res, error.message);
    } else {
      internalError(res, errorMessage);
    }
    return null;
  }
}
