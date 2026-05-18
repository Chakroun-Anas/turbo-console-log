import type { FunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'nested function calls spanning multiple lines',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$result = processData(',
    '  fetchUser(',
    '    getUserId()',
    '  )',
    ');',
  ],
  selectionLine: 1,
  variableName: '$result',
} satisfies FunctionCallAssignmentCheckerTestCase;
