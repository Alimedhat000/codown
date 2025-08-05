import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: 'info',
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
    new transports.Console(), // Log to console
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});
