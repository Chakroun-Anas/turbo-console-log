import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase2: WithinReturnStatementCheckerTestCase = {
  name: 'return with property access',
  fileExtension: 'php',
  lines: ['<?php', 'function getName() {', '    return $user->name;', '}'],
  selectionLine: 2,
  variableName: '$user->name',
};
