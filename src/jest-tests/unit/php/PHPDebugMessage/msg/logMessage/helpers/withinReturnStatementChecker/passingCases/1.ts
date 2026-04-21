import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase1: WithinReturnStatementCheckerTestCase = {
  name: 'simple return with variable',
  fileExtension: 'php',
  lines: ['<?php', 'function getUser() {', '    return $user;', '}'],
  selectionLine: 2,
  variableName: '$user',
};
