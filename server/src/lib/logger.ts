import { createLogger, format, transports } from 'winston';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

export const logger = createLogger({
  level: isProduction ? 'error' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.colorize({ all: true }),
    format.splat(),
    format.printf(({ timestamp, level, message, action, userId, ip }) => {
      const userInfo = userId ? `[User:${userId}]` : '[Anonymous]';
      const ipInfo = ip ? `[IP:${ip === '::1' ? 'Localhost' : ip}]` : '';
      const actionInfo = action ? `[${action}]` : '';

      return `[${timestamp}] ${level}: ${actionInfo}${userInfo}${ipInfo} ${message}`;
    })
  ),
  transports: [
    // Console logging only in development
    ...(!isProduction && !isTest ? [new transports.Console()] : []),

    // Error log file (always in prod, optional in dev)
    new transports.File({ filename: 'logs/error.log', level: 'error' }),

    // Combined log file only in development
    ...(!isProduction && !isTest ? [new transports.File({ filename: 'logs/combined.log' })] : []),
  ],
});

// Disable all logging in test environment
if (isTest) {
  logger.clear();
}
