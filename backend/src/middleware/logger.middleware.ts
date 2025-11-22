import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  responseTime?: number;
  userAgent?: string;
  ip: string;
  userId?: string;
  error?: string;
}

class Logger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDir();
  }

  private ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFileName(type: 'access' | 'error' | 'app'): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${type}-${date}.log`);
  }

  private writeLog(type: 'access' | 'error' | 'app', entry: LogEntry | string) {
    const logFile = this.getLogFileName(type);
    const logEntry = typeof entry === 'string' 
      ? `${new Date().toISOString()} - ${entry}\n`
      : `${JSON.stringify(entry)}\n`;
    
    fs.appendFileSync(logFile, logEntry);
  }

  logAccess(entry: LogEntry) {
    this.writeLog('access', entry);
    
    if (process.env.NODE_ENV === 'development') {
      const { method, url, status, responseTime } = entry;
      console.log(`${method} ${url} ${status} - ${responseTime}ms`);
    }
  }

  logError(error: Error, req?: Request) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req?.method || 'UNKNOWN',
      url: req?.originalUrl || 'UNKNOWN',
      ip: req?.ip || 'UNKNOWN',
      userAgent: req?.get('User-Agent'),
      userId: (req as any)?.user?.id,
      error: error.message
    };

    this.writeLog('error', entry);
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`ERROR: ${error.message}`, error.stack);
    }
  }

  logApp(message: string) {
    this.writeLog('app', message);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(message);
    }
  }
}

const logger = new Logger();

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip || 'unknown',
      userId: (req as any)?.user?.id
    };

    logger.logAccess(entry);
  });

  next();
};

export const errorLogger = (error: Error, req?: Request) => {
  logger.logError(error, req);
};

export const appLogger = (message: string) => {
  logger.logApp(message);
};

export default logger;
