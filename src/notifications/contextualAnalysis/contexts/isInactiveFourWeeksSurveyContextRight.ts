import { collectWorkspaceContext } from '../helpers';

/**
 * Evaluates if the current workspace context is optimal for showing the
 * Inactive Four Weeks Survey notification.
 * @returns {boolean} True if score ≥ 200, false otherwise
 */
export function isInactiveFourWeeksSurveyContextRight(): boolean {
  const ctx = collectWorkspaceContext();

  let score = 100;

  // ============================================================================
  // DAY OF WEEK MULTIPLIERS (critical for surveys - weekend >> weekday)
  // ============================================================================
  if (ctx.dayOfWeek === 'SATURDAY') {
    score *= 2.2;
  } else if (ctx.dayOfWeek === 'SUNDAY') {
    score *= 1.4;
  } else if (ctx.dayOfWeek === 'FRIDAY') {
    score *= 1.3;
  } else if (ctx.dayOfWeek === 'MONDAY') {
    score *= 1.3;
  } else if (ctx.dayOfWeek === 'TUESDAY') {
    score *= 1.08;
  } else if (ctx.dayOfWeek === 'THURSDAY') {
    score *= 0.85;
  } else if (ctx.dayOfWeek === 'WEDNESDAY') {
    score *= 0.54;
  }

  // ============================================================================
  // TIME OF DAY MULTIPLIERS (surveys work best at night/evening)
  // ============================================================================
  if (ctx.periodOfDay === 'night') {
    score *= 1.6;
  } else if (ctx.periodOfDay === 'evening') {
    score *= 1.35;
  } else if (ctx.periodOfDay === 'morning') {
    score *= 0.85;
  } else if (ctx.periodOfDay === 'afternoon') {
    score *= 0.8;
  }

  // ============================================================================
  // OPEN EDITORS MULTIPLIERS (light context >> deep focus)
  // ============================================================================
  if (ctx.openEditorsCount >= 1 && ctx.openEditorsCount <= 2) {
    score *= 1.3;
  } else if (ctx.openEditorsCount >= 11) {
    score *= 0.88;
  } else if (ctx.openEditorsCount >= 3 && ctx.openEditorsCount <= 5) {
    score *= 0.85;
  } else if (ctx.openEditorsCount >= 6 && ctx.openEditorsCount <= 10) {
    score *= 0.77;
  } else if (ctx.openEditorsCount === 0) {
    score *= 0.7;
  }

  // ============================================================================
  // UNSAVED FILES MULTIPLIERS (minor signal, mostly neutral)
  // ============================================================================
  if (ctx.unsavedFilesCount >= 1 && ctx.unsavedFilesCount <= 2) {
    score *= 1.0;
  } else if (ctx.unsavedFilesCount === 0) {
    score *= 0.96;
  } else {
    score *= 0.96;
  }

  const THRESHOLD = 200;
  return score >= THRESHOLD;
}
