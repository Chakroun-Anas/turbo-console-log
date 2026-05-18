import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase9: WithinReturnStatementCheckerTestCase = {
  name: 'multi-line return statement (3 lines)',
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
};
