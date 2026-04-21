import type { WithinReturnStatementCheckerTestCase } from '../types';

export const failingCase1: WithinReturnStatementCheckerTestCase = {
  name: 'variable assignment should not match',
  fileExtension: 'php',
  lines: [
    '<?php',
    'function test() {',
    '    $result = getValue();',
    '    return $result;',
    '}',
  ],
  selectionLine: 2,
  variableName: '$result',
};
