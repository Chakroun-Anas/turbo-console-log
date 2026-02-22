import { collectWorkspaceContext } from '../helpers';

/**
 * Evaluates if the current context is suitable for showing Workspace Log Threshold notification
 * @returns true if context is favorable, false otherwise
 */
export function isWorkspaceLogThresholdContextRight(): boolean {
  const ctx = collectWorkspaceContext();

  // Start with base score of 100
  let score = 100;

  // DAY OF WEEK MULTIPLIERS
  // Weekend discovery pattern (similar to Release Announcement)
  if (ctx.dayOfWeek === 'SATURDAY') {
    score *= 1.5;
  } else if (ctx.dayOfWeek === 'SUNDAY') {
    score *= 1.4;
  } else if (ctx.dayOfWeek === 'FRIDAY') {
    score *= 1.12;
  } else if (ctx.dayOfWeek === 'THURSDAY') {
    score *= 1.0; // baseline
  } else if (ctx.dayOfWeek === 'WEDNESDAY') {
    score *= 0.99;
  } else if (ctx.dayOfWeek === 'TUESDAY') {
    score *= 0.92;
  } else if (ctx.dayOfWeek === 'MONDAY') {
    score *= 0.91;
  }

  // TIME OF DAY MULTIPLIERS
  // Night/evening exploration (same pattern as Release Announcement)
  if (ctx.periodOfDay === 'night') {
    score *= 1.31;
  } else if (ctx.periodOfDay === 'evening') {
    score *= 1.15;
  } else if (ctx.periodOfDay === 'afternoon') {
    score *= 0.95;
  } else if (ctx.periodOfDay === 'morning') {
    score *= 0.94;
  }

  // UNSAVED FILES MULTIPLIERS
  // Active coding session
  if (ctx.unsavedFilesCount >= 1 && ctx.unsavedFilesCount <= 2) {
    score *= 1.17;
  } else if (ctx.unsavedFilesCount === 0) {
    score *= 1.0; // baseline
  } else if (ctx.unsavedFilesCount >= 3) {
    score *= 0.96; // slight penalty for chaos
  }

  // OPEN EDITORS MULTIPLIERS
  // Light context (fresh start or light focus)
  if (ctx.openEditorsCount === 0) {
    score *= 1.09;
  } else if (ctx.openEditorsCount >= 1 && ctx.openEditorsCount <= 2) {
    score *= 1.06;
  } else if (ctx.openEditorsCount >= 3 && ctx.openEditorsCount <= 5) {
    score *= 0.96;
  } else if (ctx.openEditorsCount >= 11) {
    score *= 0.96;
  } else if (ctx.openEditorsCount >= 6 && ctx.openEditorsCount <= 10) {
    score *= 0.9;
  }

  // Threshold: Accept if score >= 150 (50% above baseline)
  // Targets weekend/evening exploratory sessions
  const THRESHOLD = 150;

  return score >= THRESHOLD;
}
