import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase8: WithinReturnStatementCheckerTestCase = {
  name: 'return with binary expression',
  fileExtension: 'php',
  lines: ['<?php', 'function calculate() {', '    return $a + $b;', '}'],
  selectionLine: 2,
  variableName: '$a',
};
