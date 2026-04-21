import type { WithinReturnStatementCheckerTestCase } from '../types';

export const failingCase4: WithinReturnStatementCheckerTestCase = {
  name: 'variable before return should not match',
  fileExtension: 'php',
  lines: [
    '<?php',
    'function calculate() {',
    '    $sum = $a + $b;',
    '    return $sum;',
    '}',
  ],
  selectionLine: 2,
  variableName: '$sum',
};
