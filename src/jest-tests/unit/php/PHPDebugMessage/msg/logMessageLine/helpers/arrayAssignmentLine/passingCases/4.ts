import { ArrayAssignmentLineTestCase } from '../types';

export const passingCase4: ArrayAssignmentLineTestCase = {
  name: 'multi-line array with short syntax',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$items = [',
    '    "apple",',
    '    "banana",',
    '    "cherry"',
    '];',
    'sort($items);',
  ],
  selectionLine: 1,
  variableName: '$items',
  expectedLine: 6,
};
