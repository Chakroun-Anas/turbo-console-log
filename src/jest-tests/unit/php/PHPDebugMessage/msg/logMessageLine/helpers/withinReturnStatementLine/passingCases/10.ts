import type { WithinReturnStatementLineTestCase } from '../types';

export const passingCase10: WithinReturnStatementLineTestCase = {
  name: 'multi-line ternary in return (5 lines)',
  fileExtension: 'php',
  lines: [
    '<?php',
    'function decide() {',
    '    return $condition',
    '        ? $trueValue',
    '        : $falseValue;',
    '}',
  ],
  selectionLine: 3,
  variableName: '$trueValue',
  expectedLine: 2,
};
