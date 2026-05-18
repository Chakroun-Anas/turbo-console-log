import type { WithinReturnStatementLineTestCase } from '../types';

export const passingCase9: WithinReturnStatementLineTestCase = {
  name: 'return inside closure',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$callback = function($item) {',
    '    return $item->value;',
    '};',
  ],
  selectionLine: 2,
  variableName: '$item->value',
  expectedLine: 2,
};
