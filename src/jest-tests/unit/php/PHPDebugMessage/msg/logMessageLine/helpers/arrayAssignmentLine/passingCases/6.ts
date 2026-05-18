import { ArrayAssignmentLineTestCase } from '../types';

export const passingCase6: ArrayAssignmentLineTestCase = {
  name: 'associative array with multiple lines',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$user = [',
    '    "name" => "John",',
    '    "age" => 30,',
    '    "email" => "john@example.com"',
    '];',
    'echo $user["name"];',
  ],
  selectionLine: 1,
  variableName: '$user',
  expectedLine: 6,
};
