import type { WithinReturnStatementLineTestCase } from '../types';

export const passingCase1: WithinReturnStatementLineTestCase = {
  name: 'simple return with variable',
  fileExtension: 'php',
  lines: ['<?php', 'function getUser() {', '    return $user;', '}'],
  selectionLine: 2,
  variableName: '$user',
  expectedLine: 2, // Insert log before the return
};
