import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase15: WithinReturnStatementCheckerTestCase = {
  name: 'return with variable in multi-line ternary',
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
};
