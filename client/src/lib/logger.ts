import * as Sentry from '@sentry/react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const isDev = import.meta.env.DEV;
const LOG_PREFIX = '[App]';

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `${timestamp} ${LOG_PREFIX} [${level.toUpperCase()}] ${message}${contextStr}`;
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (isDev) {
      console.debug(formatMessage('debug', message, context));
    }
  },

  info(message: string, context?: LogContext): void {
    console.log(formatMessage('info', message, context));
  },

  warn(message: string, context?: LogContext): void {
    console.warn(formatMessage('warn', message, context));
    
    if (!isDev) {
      Sentry.addBreadcrumb({
        category: 'warning',
        message,
        data: context,
        level: 'warning',
      });
    }
  },

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(formatMessage('error', message, context), err);
    
    Sentry.captureException(err, {
      extra: { message, ...context },
    });
  },

  api(method: string, url: string, status: number, duration: number): void {
    const level = status >= 400 ? 'warn' : 'info';
    this[level](`API ${method} ${url}`, { status, duration: `${duration}ms` });
  },

  performance(metric: string, value: number, context?: LogContext): void {
    this.info(`Performance: ${metric}`, { value, ...context });
  },

  userAction(action: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, context);
    
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: action,
      data: context,
      level: 'info',
    });
  },
};

export default logger;
