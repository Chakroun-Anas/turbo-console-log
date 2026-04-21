import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase5: WithinReturnStatementCheckerTestCase = {
  name: 'return with ternary expression',
  fileExtension: 'php',
  lines: [
    '<?php',
    'function getValue() {',
    '    return $condition ? $value1 : $value2;',
    '}',
  ],
  selectionLine: 2,
  variableName: '$value1',
};
