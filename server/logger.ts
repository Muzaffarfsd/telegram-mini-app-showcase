import pino from 'pino';

// Create Pino logger with structured logging
const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  process.env.NODE_ENV === 'production'
    ? pino.destination()
    : pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      })
);

// Structured logging functions
export const logInfo = (message: string, data?: Record<string, any>) => {
  logger.info(data || {}, message);
};

export const logError = (message: string, error?: Error | unknown, data?: Record<string, any>) => {
  const errorData = error instanceof Error 
    ? { 
        error: error.message,
        stack: error.stack,
        ...data 
      }
    : { error: String(error), ...data };
  
  logger.error(errorData, message);
};

export const logWarn = (message: string, data?: Record<string, any>) => {
  logger.warn(data || {}, message);
};

export const logDebug = (message: string, data?: Record<string, any>) => {
  logger.debug(data || {}, message);
};

// API logging
export const logRequest = (method: string, path: string, statusCode: number, duration: number, data?: Record<string, any>) => {
  const logData = {
    method,
    path,
    statusCode,
    duration,
    ...data,
  };
  const message = `${method} ${path} ${statusCode} ${duration}ms`;
  if (statusCode >= 400) {
    logger.warn(logData, message);
  } else {
    logger.info(logData, message);
  }
};

// Database logging
export const logDatabase = (operation: string, table: string, duration: number, error?: Error) => {
  if (error) {
    logError(`Database ${operation} failed on ${table}`, error, { operation, table, duration });
  } else {
    logDebug(`Database ${operation} on ${table}`, { operation, table, duration });
  }
};

// User action logging
export const logUserAction = (userId: string | number | undefined, action: string, data?: Record<string, any>) => {
  logInfo(`User action: ${action}`, {
    userId,
    action,
    ...data,
  });
};

// Critical event logging for business metrics
export const logCriticalEvent = (eventName: string, data: Record<string, any>) => {
  logger.warn(data, `CRITICAL EVENT: ${eventName}`);
};

export default logger;
