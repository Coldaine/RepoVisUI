/**
 * RepoVis Diagnostic Logger
 * Provides structured logging with visual markers for debugging the data pipeline.
 */

const LOG_PREFIX = '[-] RepoVis ::';

export const logger = {
  info: (context: string, message: string, data?: any) => {
    console.log(`%c${LOG_PREFIX} [INFO] [${context}] ${message}`, 'color: #0088ff; font-weight: bold;', data || '');
  },
  warn: (context: string, message: string, data?: any) => {
    console.warn(`%c${LOG_PREFIX} [WARN] [${context}] ${message}`, 'color: #ffaa00; font-weight: bold;', data || '');
  },
  error: (context: string, message: string, data?: any) => {
    console.error(`%c${LOG_PREFIX} [ERROR] [${context}] ${message}`, 'color: #ff3300; font-weight: bold;', data || '');
  },
  success: (context: string, message: string, data?: any) => {
    console.log(`%c${LOG_PREFIX} [OK] [${context}] ${message}`, 'color: #00ffaa; font-weight: bold;', data || '');
  },
  trace: (context: string, message: string) => {
    console.debug(`%c${LOG_PREFIX} [TRACE] [${context}] ${message}`, 'color: #888888; font-style: italic;');
  }
};
