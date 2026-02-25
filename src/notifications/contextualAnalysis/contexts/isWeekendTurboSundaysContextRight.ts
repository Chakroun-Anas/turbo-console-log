import { collectWorkspaceContext } from '../helpers';

/**
 * Evaluates if the current context is suitable for showing Weekend Turbo Sundays notification
 * @returns true if context is favorable, false otherwise
 */
export function isWeekendTurboSundaysContextRight(): boolean {
  const ctx = collectWorkspaceContext();

  // Start with base score of 100
  let score = 100;

  // DAY OF WEEK MULTIPLIERS
  // Sunday is the star (event name: "Turbo Sundays")
  if (ctx.dayOfWeek === 'SUNDAY') {
    score *= 1.1;
  } else if (ctx.dayOfWeek === 'SATURDAY') {
    score *= 0.95;
  } else {
    // Weekdays should rarely fire (tiny samples, mostly noise)
    score *= 0.5;
  }

  // TIME OF DAY MULTIPLIERS
  // Weekend morning momentum (opposite of Release Announcement!)
  if (ctx.periodOfDay === 'morning') {
    score *= 1.1;
  } else if (ctx.periodOfDay === 'evening') {
    score *= 1.01;
  } else if (ctx.periodOfDay === 'afternoon') {
    score *= 0.97;
  } else if (ctx.periodOfDay === 'night') {
    score *= 0.89;
  }

  // OPEN EDITORS MULTIPLIERS
  // Fresh start (0 editors) and light focus (3-5) perform best
  if (ctx.openEditorsCount === 0) {
    score *= 1.11;
  } else if (ctx.openEditorsCount >= 3 && ctx.openEditorsCount <= 5) {
    score *= 1.05;
  } else if (ctx.openEditorsCount >= 1 && ctx.openEditorsCount <= 2) {
    score *= 0.98;
  } else if (ctx.openEditorsCount >= 6) {
    score *= 0.9;
  }

  // Threshold: Accept if score >= 130 (30% above baseline)
  // Targets Sunday morning momentum pattern (max achievable: 134.3)
  const THRESHOLD = 130;

  return score >= THRESHOLD;
}
