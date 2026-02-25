import { collectWorkspaceContext } from '../helpers';

export function isJSMessyFileContextRight(): boolean {
  const ctx = collectWorkspaceContext();
  let score = 100;

  // DAY OF WEEK MULTIPLIERS (Focused Exploration Pattern)
  if (ctx.dayOfWeek === 'SATURDAY')
    score *= 1.36; // 12.2% CTR (+36%)
  else if (ctx.dayOfWeek === 'SUNDAY')
    score *= 1.13; // 10.2% CTR (+13%)
  else if (ctx.dayOfWeek === 'WEDNESDAY')
    score *= 1.09; // 9.8% CTR (+10%)
  else if (ctx.dayOfWeek === 'THURSDAY')
    score *= 1.02; // 9.2% CTR (+2%)
  else if (ctx.dayOfWeek === 'TUESDAY')
    score *= 0.98; // 8.8% CTR (-2%)
  else if (ctx.dayOfWeek === 'FRIDAY')
    score *= 0.89; // 8.0% CTR (-11%)
  else if (ctx.dayOfWeek === 'MONDAY') score *= 0.88; // 7.9% CTR (-12%)

  // TIME OF DAY MULTIPLIERS (Refactoring Time)
  if (ctx.periodOfDay === 'night')
    score *= 1.38; // 12.4% CTR (+38%)
  else if (ctx.periodOfDay === 'evening')
    score *= 1.08; // 9.7% CTR (+8%)
  else if (ctx.periodOfDay === 'afternoon')
    score *= 0.92; // 8.3% CTR (-8%)
  else if (ctx.periodOfDay === 'morning') score *= 0.91; // 8.2% CTR (-9%)

  // TERMINAL COUNT MULTIPLIERS (Technical Activity Indicator)
  // Unlike discovery events where terminal count is noise, for technical/action events
  // terminal count indicates active development workflow
  if (ctx.terminalCount >= 4)
    score *= 1.31; // 11.8% CTR (+32%)
  else if (ctx.terminalCount >= 2 && ctx.terminalCount <= 3)
    score *= 1.07; // 9.6% CTR (+7%)
  else if (ctx.terminalCount === 1)
    score *= 0.92; // 8.3% CTR (-7%)
  else if (ctx.terminalCount === 0) score *= 0.86; // 7.7% CTR (-14%)

  // OPEN EDITORS MULTIPLIERS (Focused Work Pattern - INVERTED from CommitWithLogs)
  // JSMessyFile prefers FOCUSED contexts (0-2 editors), not chaos
  // Users want to refactor/clean up when focused on one file
  if (ctx.openEditorsCount === 0)
    score *= 1.19; // 10.7% CTR (+20%)
  else if (ctx.openEditorsCount >= 1 && ctx.openEditorsCount <= 2)
    score *= 1.08; // 9.7% CTR (+8%)
  else if (ctx.openEditorsCount >= 11)
    score *= 1.03; // 9.3% CTR (+3%)
  else if (ctx.openEditorsCount >= 3 && ctx.openEditorsCount <= 5)
    score *= 0.94; // 8.5% CTR (-6%)
  else if (ctx.openEditorsCount >= 6 && ctx.openEditorsCount <= 10)
    score *= 0.87; // 7.8% CTR (-13%)

  const THRESHOLD = 140;
  return score >= THRESHOLD;
}
