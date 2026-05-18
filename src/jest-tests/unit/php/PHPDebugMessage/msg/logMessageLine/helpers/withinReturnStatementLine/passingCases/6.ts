import type { WithinReturnStatementLineTestCase } from '../types';

export const passingCase6: WithinReturnStatementLineTestCase = {
  name: 'return with binary expression',
  fileExtension: 'php',
  lines: ['<?php', 'function calculate() {', '    return $a + $b;', '}'],
  selectionLine: 2,
  variableName: '$a',
  expectedLine: 2,
};
