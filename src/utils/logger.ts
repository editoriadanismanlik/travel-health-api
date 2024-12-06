import winston from 'winston';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

// Define log formats
const formats = {
  console: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level}]: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`
    )
  ),
  file: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
};

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    // Console transport
    new winston.transports.Console({
      format: formats.console,
    }),
    // Error log file transport
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: formats.file,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file transport
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: formats.file,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      format: formats.file,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      format: formats.file,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add request logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'requests.log'),
      format: formats.file,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

export default logger;
