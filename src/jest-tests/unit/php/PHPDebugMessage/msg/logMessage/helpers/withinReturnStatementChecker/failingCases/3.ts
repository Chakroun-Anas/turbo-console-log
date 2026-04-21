import type { WithinReturnStatementCheckerTestCase } from '../types';

export const failingCase3: WithinReturnStatementCheckerTestCase = {
  name: 'function parameter should not match',
  fileExtension: 'php',
  lines: ['<?php', 'function process($data) {', '    return true;', '}'],
  selectionLine: 1,
  variableName: '$data',
};
