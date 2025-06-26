import { ExtensionProperties } from '../../../../../entities';

export function logFunctionToUse(
  logFunction: ExtensionProperties['logFunction'],
  logType: ExtensionProperties['logType'],
  args?: unknown[],
): string {
  if (
    args &&
    args.length > 0 &&
    typeof args[0] === 'object' &&
    args[0] !== null
  ) {
    const firstArg = args[0] as Record<string, unknown>;
    if ('logFunction' in firstArg && typeof firstArg.logFunction === 'string') {
      return firstArg.logFunction;
    }
    if ('logType' in firstArg && typeof firstArg.logType === 'string') {
      return firstArg.logType;
    }
    return logFunction;
  }
  if (logFunction === 'log' && logType !== 'log') {
    return logType;
  }
  return logFunction;
}
