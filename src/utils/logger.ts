/**
 * Simple wrapper to console methods - no timing logic
 */
export class Logger {
  constructor(private context: string) {}
  
  debug(message: string, data?: any): void {
    // No debug output
  }
  
  info(message: string, data?: any): void {
    console.error(`[INFO] [${this.context}] ${message}`);
  }
  
  warn(message: string, data?: any): void {
    console.error(`[WARN] [${this.context}] ${message}`);
  }
  
  error(message: string, error?: Error, data?: any): void {
    console.error(`[ERROR] [${this.context}] ${message}`);
    if (error?.stack) {
      console.error(error.stack);
    }
  }
}

/**
 * Creates a logger wrapper without any timing logic
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * Root logger instance
 */
export const rootLogger = createLogger('root'); 