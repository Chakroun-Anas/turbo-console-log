import { collectWorkspaceContext } from '../helpers';

export function isCommitWithLogsContextRight(): boolean {
  const ctx = collectWorkspaceContext();
  let score = 100;

  // DAY OF WEEK MULTIPLIERS
  if (ctx.dayOfWeek === 'SATURDAY') score *= 1.48;
  else if (ctx.dayOfWeek === 'THURSDAY') score *= 1.17;
  else if (ctx.dayOfWeek === 'SUNDAY') score *= 1.09;
  else if (ctx.dayOfWeek === 'TUESDAY') score *= 1.0;
  else if (ctx.dayOfWeek === 'WEDNESDAY') score *= 1.0;
  else if (ctx.dayOfWeek === 'FRIDAY') score *= 1.0;
  else if (ctx.dayOfWeek === 'MONDAY') score *= 0.78;

  // TIME OF DAY MULTIPLIERS
  if (ctx.periodOfDay === 'night') score *= 1.29;
  else if (ctx.periodOfDay === 'evening') score *= 0.98;
  else if (ctx.periodOfDay === 'afternoon') score *= 0.98;
  else if (ctx.periodOfDay === 'morning') score *= 0.91;

  // TERMINAL COUNT MULTIPLIERS
  if (ctx.terminalCount >= 4) score *= 1.21;
  else if (ctx.terminalCount === 0) score *= 1.05;
  else if (ctx.terminalCount >= 2 && ctx.terminalCount <= 3) score *= 1.0;
  else if (ctx.terminalCount === 1) score *= 0.91;

  // OPEN EDITORS MULTIPLIERS
  if (ctx.openEditorsCount >= 6 && ctx.openEditorsCount <= 10) score *= 1.12;
  else if (ctx.openEditorsCount === 0) score *= 1.02;
  else if (ctx.openEditorsCount >= 1 && ctx.openEditorsCount <= 2) score *= 1.0;
  else if (ctx.openEditorsCount >= 11) score *= 0.98;
  else if (ctx.openEditorsCount >= 3 && ctx.openEditorsCount <= 5)
    score *= 0.93;

  // UNSAVED FILES MULTIPLIERS
  // Note: 3+ unsaved has only 35 samples (too small, statistically unreliable)
  // Real signal: Has unsaved files (1+) vs clean (0)
  if (ctx.unsavedFilesCount >= 1)
    score *= 1.03; // 6.0% CTR vs 5.8% baseline (546 samples)
  else score *= 1.0; // 5.8% CTR baseline (18,327 samples)

  const THRESHOLD = 150;
  return score >= THRESHOLD;
}
