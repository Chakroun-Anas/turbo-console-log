/**
 * Gets the appropriate log function string.
 * @param logFunction The log function to be used
 * @returns The formatted log function string
 */
export function getLogFunction(logFunction: string): string {
  switch (logFunction) {
    case 'log':
      return 'console.log';
    case 'debug':
      return 'console.debug';
    case 'info':
      return 'console.info';
    case 'warn':
      return 'console.warn';
    case 'table':
      return 'console.table';
    case 'error':
      return 'console.error';
    default:
      return logFunction;
  }
}
