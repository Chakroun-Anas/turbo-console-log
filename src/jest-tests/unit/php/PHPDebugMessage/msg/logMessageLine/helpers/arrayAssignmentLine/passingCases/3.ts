import { ArrayAssignmentLineTestCase } from '../types';

export const passingCase3: ArrayAssignmentLineTestCase = {
  name: 'multi-line array assignment with closing bracket on different line',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$config = array(',
    '    "host" => "localhost",',
    '    "port" => 3306',
    ');',
    'connect($config);',
  ],
  selectionLine: 1,
  variableName: '$config',
  expectedLine: 5,
};
