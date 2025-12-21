import type { Request, Response, NextFunction } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

export interface OrderData {
  selectedFeatures: string[];
  projectName: string;
  totalAmount: number;
  currency?: string;
  customerId?: string;
}

export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: number;
}

export interface RequestWithRateLimit extends Request {
  rateLimit?: RateLimitInfo;
}

export interface TelegramUserData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
  code?: string;
}

export interface ApiSuccess<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedRequest {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface PhotoUploadRequest {
  fileSize?: number;
  fileType?: string;
}

export interface PhotoCreateRequest {
  url: string;
  telegramId: number;
  text?: string;
  isFeatured?: boolean;
}

export interface TaskStartRequest {
  task_id: string;
  platform?: string;
  task_type?: string;
  coins_reward: number;
  xp_reward?: number;
}

export interface TaskVerifyRequest {
  task_id: string;
  verification_data?: Record<string, unknown>;
}

export interface TaskCompleteRequest {
  taskId: string;
  xpAmount: number;
  coinsAmount?: number;
}

export interface ReferralApplyRequest {
  referralCode: string;
  userId?: number;
}

export interface AwardXpRequest {
  telegramId: number;
  xpAmount: number;
  action: string;
}

export interface NotificationSendRequest {
  chatId: number;
  message: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

export interface NotificationBroadcastRequest {
  userIds: number[];
  message: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

export interface NotificationButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface NotificationInteractiveRequest {
  chatId: number;
  message: string;
  buttons?: NotificationButton[][];
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

export interface TrackEventRequest {
  type: string;
  data?: Record<string, unknown>;
  telegramId?: number;
  sessionId?: string;
}

export interface ABEventRequest {
  experiment: string;
  variant: 'A' | 'B';
  eventType: 'exposure' | 'conversion';
  userId?: string;
  timestamp?: number;
}

export interface ReviewCreateRequest {
  text: string;
  rating: number;
  name: string;
  location?: string;
  avatar_url?: string;
  telegram_id?: number;
  is_featured?: boolean;
}

export interface UserInitRequest {
  telegram_id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  referrer_code?: string;
}

export interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  orderId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentSuccessRequest {
  paymentIntentId: string;
  orderId?: string;
}

export type TypedRequest<
  TBody = unknown,
  TParams extends ParamsDictionary = ParamsDictionary,
  TQuery extends ParsedQs = ParsedQs
> = Request<TParams, unknown, TBody, TQuery>;

export type TypedResponse<T = unknown> = Response<T | ApiError>;

export type TypedRequestHandler<
  TBody = unknown,
  TParams extends ParamsDictionary = ParamsDictionary,
  TQuery extends ParsedQs = ParsedQs,
  TResponse = unknown
> = (
  req: TypedRequest<TBody, TParams, TQuery>,
  res: TypedResponse<TResponse>,
  next: NextFunction
) => void | Promise<void>;
