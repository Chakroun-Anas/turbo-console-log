import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase10: WithinReturnStatementCheckerTestCase = {
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
};
