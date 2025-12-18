/* eslint-disable no-console */
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMeta {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, meta?: LogMeta): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
  }

  info(message: string, meta?: LogMeta): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, meta));
    }
  }

  warn(message: string, meta?: LogMeta): void {
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  error(message: string, meta?: LogMeta): void {
    // Errors são sempre logados, mesmo em produção
    console.error(this.formatMessage('error', message, meta));
  }

  debug(message: string, meta?: LogMeta): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger();
