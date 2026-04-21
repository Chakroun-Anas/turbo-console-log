import type { WithinReturnStatementLineTestCase } from '../types';

export const passingCase7: WithinReturnStatementLineTestCase = {
  name: 'multi-line return statement (4 lines)',
  fileExtension: 'php',
  lines: [
    '<?php',
    'function getConfig() {',
    '    return [',
    '        "name" => $name,',
    '        "email" => $email',
    '    ];',
    '}',
  ],
  selectionLine: 3,
  variableName: '$name',
  expectedLine: 2, // Insert before the return statement starts
};
