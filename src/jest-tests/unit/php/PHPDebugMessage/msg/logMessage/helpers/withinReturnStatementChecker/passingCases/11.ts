import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase11: WithinReturnStatementCheckerTestCase = {
  name: 'return with concatenation',
  fileExtension: 'php',
  lines: [
    '<?php',
    'function getMessage() {',
    '    return "Hello " . $name;',
    '}',
  ],
  selectionLine: 2,
  variableName: '$name',
};
