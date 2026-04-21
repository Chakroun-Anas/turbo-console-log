import { ArrayAssignmentLineTestCase } from '../types';

export const passingCase9: ArrayAssignmentLineTestCase = {
  name: 'array assignment with trailing comma',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$colors = [',
    '    "red",',
    '    "green",',
    '    "blue",',
    '];',
    'echo $colors[0];',
  ],
  selectionLine: 1,
  variableName: '$colors',
  expectedLine: 6,
};
