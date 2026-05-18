import type { WithinReturnStatementLineTestCase } from '../types';

export const passingCase8: WithinReturnStatementLineTestCase = {
  name: 'multi-line return with function call (4 lines)',
  fileExtension: 'php',
  lines: [
    '<?php',
    'function process() {',
    '    return processData(',
    '        $data,',
    '        $options',
    '    );',
    '}',
  ],
  selectionLine: 3,
  variableName: '$data',
  expectedLine: 2, // Insert before the return statement
};
