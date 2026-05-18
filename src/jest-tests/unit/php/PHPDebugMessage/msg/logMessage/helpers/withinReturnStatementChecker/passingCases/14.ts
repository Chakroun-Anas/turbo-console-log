import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase14: WithinReturnStatementCheckerTestCase = {
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
};
