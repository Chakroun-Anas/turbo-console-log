/**
 * Removes specified keys from an object and returns a new object without those keys.
 * @param obj The source object
 * @param keys Array of keys to omit
 * @returns New object without the specified keys
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const clone = { ...obj };
  keys.forEach((key) => delete clone[key]);
  return clone;
}
