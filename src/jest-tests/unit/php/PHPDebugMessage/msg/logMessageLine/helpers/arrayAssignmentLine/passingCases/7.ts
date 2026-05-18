import { ArrayAssignmentLineTestCase } from '../types';

export const passingCase7: ArrayAssignmentLineTestCase = {
  name: 'array assignment inside function',
  fileExtension: 'php',
  lines: [
    '<?php',
    'function getData() {',
    '    $result = array("success", "data");',
    '    return $result;',
    '}',
  ],
  selectionLine: 2,
  variableName: '$result',
  expectedLine: 3,
};
