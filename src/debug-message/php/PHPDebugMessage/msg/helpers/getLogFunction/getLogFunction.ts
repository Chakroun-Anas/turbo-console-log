/**
 * Gets the appropriate PHP log function string.
 * @param logFunction The log function to be used
 * @returns The formatted log function string
 */
export function getLogFunction(logFunction: string): string {
  switch (logFunction) {
    case 'error_log':
      return 'error_log';
    case 'var_dump':
      return 'var_dump';
    case 'print_r':
      return 'print_r';
    default:
      return logFunction;
  }
}
