import { collectWorkspaceContext } from '../helpers';

/**
 * Evaluates if the current context is suitable for showing Release Announcement notification
 * @returns true if context is favorable, false otherwise
 */
export function isReleaseAnnouncementContextRight(): boolean {
  const ctx = collectWorkspaceContext();

  // Start with base score of 100
  let score = 100;

  // DAY OF WEEK MULTIPLIERS
  if (ctx.dayOfWeek === 'SATURDAY') {
    score *= 1.42;
  } else if (ctx.dayOfWeek === 'THURSDAY') {
    score *= 1.2;
  } else if (ctx.dayOfWeek === 'FRIDAY') {
    score *= 1.2;
  } else if (ctx.dayOfWeek === 'SUNDAY') {
    score *= 1.14;
  } else if (ctx.dayOfWeek === 'WEDNESDAY') {
    score *= 1.08;
  } else if (ctx.dayOfWeek === 'MONDAY') {
    score *= 0.92;
  } else if (ctx.dayOfWeek === 'TUESDAY') {
    score *= 0.91;
  }

  // TIME OF DAY MULTIPLIERS
  if (ctx.periodOfDay === 'night') {
    score *= 1.31;
  } else if (ctx.periodOfDay === 'evening') {
    score *= 1.14;
  } else if (ctx.periodOfDay === 'afternoon') {
    score *= 0.97;
  } else if (ctx.periodOfDay === 'morning') {
    score *= 0.89;
  }

  // UNSAVED FILES MULTIPLIERS
  if (ctx.unsavedFilesCount >= 1 && ctx.unsavedFilesCount <= 2) {
    score *= 1.28;
  } else if (ctx.unsavedFilesCount >= 3) {
    score *= 0.97;
  } else {
    score *= 0.985;
  }

  // OPEN EDITORS MULTIPLIERS
  if (ctx.openEditorsCount >= 1 && ctx.openEditorsCount <= 2) {
    score *= 1.09;
  } else if (ctx.openEditorsCount === 0) {
    score *= 1.02;
  } else if (ctx.openEditorsCount >= 3 && ctx.openEditorsCount <= 5) {
    score *= 1.0; // baseline, no change
  } else if (ctx.openEditorsCount >= 11) {
    score *= 0.89;
  } else if (ctx.openEditorsCount >= 6 && ctx.openEditorsCount <= 10) {
    score *= 0.83;
  }

  // Threshold: Accept if score >= 150 (50% above baseline)
  const THRESHOLD = 150;

  return score >= THRESHOLD;
}
