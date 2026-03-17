import { collectWorkspaceContext } from '../helpers';

/**
 * Evaluates if the current context is suitable for showing Inactive Two Weeks Return notification
 * @returns true if context is favorable, false otherwise
 */
export function isInactiveTwoWeeksReturnContextRight(): boolean {
  const ctx = collectWorkspaceContext();

  // Start with base score of 100
  let score = 100;

  // TIME OF DAY MULTIPLIERS
  if (ctx.periodOfDay === 'night') {
    score *= 1.42; // 12.3% CTR (+42%)
  } else if (ctx.periodOfDay === 'morning') {
    score *= 0.99; // 8.5% CTR (-1%)
  } else if (ctx.periodOfDay === 'afternoon') {
    score *= 0.97; // 8.4% CTR (-3%)
  } else if (ctx.periodOfDay === 'evening') {
    score *= 0.72; // 6.3% CTR (-28%)
  }

  // DAY OF WEEK MULTIPLIERS
  if (ctx.dayOfWeek === 'MONDAY') {
    score *= 1.23; // 10.7% CTR (+23%)
  } else if (ctx.dayOfWeek === 'SUNDAY') {
    score *= 1.06; // 9.2% CTR (+6%)
  } else if (ctx.dayOfWeek === 'TUESDAY') {
    score *= 0.99; // 8.6% CTR (-1%)
  } else if (ctx.dayOfWeek === 'THURSDAY') {
    score *= 0.99; // 8.5% CTR (-1%)
  } else if (ctx.dayOfWeek === 'FRIDAY') {
    score *= 0.94; // 8.1% CTR (-6%)
  } else if (ctx.dayOfWeek === 'SATURDAY' || ctx.dayOfWeek === 'WEDNESDAY') {
    score *= 0.86; // 7.5% CTR (-14%)
  }

  const THRESHOLD = 100;

  return score >= THRESHOLD;
}
