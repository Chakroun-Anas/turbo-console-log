import { ArrayAssignmentLineTestCase } from '../types';

export const passingCase5: ArrayAssignmentLineTestCase = {
  name: 'nested array assignment',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$matrix = array(',
    '    array(1, 2, 3),',
    '    array(4, 5, 6)',
    ');',
    'print_r($matrix);',
  ],
  selectionLine: 1,
  variableName: '$matrix',
  expectedLine: 5,
};
