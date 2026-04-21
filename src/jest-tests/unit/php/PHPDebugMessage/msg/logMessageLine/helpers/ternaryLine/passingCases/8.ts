import type { TernaryLineTestCase } from '../types';

export const passingCase8: TernaryLineTestCase = {
  name: 'multi-line ternary with function calls (4 lines)',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$data = $isValid',
    '    ? getData()',
    '    : getDefaultData();',
  ],
  selectionLine: 1,
  variableName: '$data',
  expectedLine: 4,
};
