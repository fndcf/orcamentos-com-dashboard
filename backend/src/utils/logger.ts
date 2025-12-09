type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const colors = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  debug: '\x1b[35m',
  reset: '\x1b[0m',
};

class Logger {
  private formatMessage(level: LogLevel, message: string, meta?: object): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
    return `${colors[level]}[${timestamp}] [${level.toUpperCase()}]${colors.reset} ${message}${metaString}`;
  }

  info(message: string, meta?: object): void {
    console.log(this.formatMessage('info', message, meta));
  }

  warn(message: string, meta?: object): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  error(message: string, meta?: object): void {
    console.error(this.formatMessage('error', message, meta));
  }

  debug(message: string, meta?: object): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger();
