import type { WithinReturnStatementLineTestCase } from '../types';

export const passingCase4: WithinReturnStatementLineTestCase = {
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
  expectedLine: 2,
};
