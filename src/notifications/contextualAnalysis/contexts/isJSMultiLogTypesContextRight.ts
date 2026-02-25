import { collectWorkspaceContext } from '../helpers';

/**
 * Determines if current context is right for JS Multi Log Types notification.
 * Pattern: "Active Cleanup in Messy Context"
 * - Users already juggling multiple files/terminals during refactoring
 * - "You're cleaning up anyway, standardize those mixed log types?"
 * - Strongest terminal count signal yet (6.3% spread: 14.7% → 8.4%)
 *
 * Analysis: 10,625 reactions (Jan 24 - Feb 24, 2026)
 * Baseline: 9.9% CTR (reactions), 2.2% overall
 * Threshold: 150
 *
 * Key insight: Messy active context = receptive to cleanup suggestions
 * 6-10 editors + 4+ terminals = peak engagement (14.7% CTR)
 */
export function isJSMultiLogTypesContextRight(): boolean {
  const ctx = collectWorkspaceContext();
  let score = 100;

  // DAY OF WEEK MULTIPLIERS (Weekend cleanup pattern)
  if (ctx.dayOfWeek === 'SATURDAY')
    score *= 1.33; // 13.2% CTR (+33%)
  else if (ctx.dayOfWeek === 'FRIDAY')
    score *= 1.17; // 11.6% CTR (+17%)
  else if (ctx.dayOfWeek === 'SUNDAY')
    score *= 1.09; // 10.8% CTR (+9%)
  else if (ctx.dayOfWeek === 'WEDNESDAY')
    score *= 1.01; // 10.0% CTR (+1%)
  else if (ctx.dayOfWeek === 'THURSDAY')
    score *= 0.95; // 9.4% CTR (-5%)
  else if (ctx.dayOfWeek === 'TUESDAY')
    score *= 0.93; // 9.2% CTR (-7%)
  else if (ctx.dayOfWeek === 'MONDAY') score *= 0.86; // 8.5% CTR (-14%)

  // TIME OF DAY MULTIPLIERS (Night refactoring)
  if (ctx.periodOfDay === 'night')
    score *= 1.28; // 12.7% CTR (+28%)
  else if (ctx.periodOfDay === 'evening')
    score *= 0.96; // 9.5% CTR (-4%)
  else if (ctx.periodOfDay === 'morning')
    score *= 0.95; // 9.4% CTR (-5%)
  else if (ctx.periodOfDay === 'afternoon') score *= 0.95; // 9.4% CTR (-5%)

  // TERMINAL COUNT MULTIPLIERS (STRONGEST signal - 6.3% spread)
  if (ctx.terminalCount >= 4)
    score *= 1.48; // 14.7% CTR (+48%)
  else if (ctx.terminalCount >= 2 && ctx.terminalCount <= 3)
    score *= 1.04; // 10.3% CTR (+5%)
  else if (ctx.terminalCount === 0)
    score *= 0.97; // 9.6% CTR (-3%)
  else if (ctx.terminalCount === 1) score *= 0.85; // 8.4% CTR (-15%)

  // OPEN EDITORS MULTIPLIERS (Messy context = receptive)
  if (ctx.openEditorsCount >= 6 && ctx.openEditorsCount <= 10)
    score *= 1.07; // 10.6% CTR (+8%)
  else if (ctx.openEditorsCount >= 1 && ctx.openEditorsCount <= 2)
    score *= 1.03; // 10.2% CTR (+4%)
  else if (ctx.openEditorsCount === 0)
    score *= 1.0; // 9.9% CTR (0%)
  else if (ctx.openEditorsCount >= 11)
    score *= 0.97; // 9.6% CTR (-3%)
  else if (ctx.openEditorsCount >= 3 && ctx.openEditorsCount <= 5)
    score *= 0.93; // 9.2% CTR (-7%)

  // UNSAVED FILES MULTIPLIERS (Active changes = cleanup mode)
  if (ctx.unsavedFilesCount >= 1) score *= 1.21; // 12.0% CTR (+21%) - 443 samples

  const THRESHOLD = 150;
  return score >= THRESHOLD;
}
