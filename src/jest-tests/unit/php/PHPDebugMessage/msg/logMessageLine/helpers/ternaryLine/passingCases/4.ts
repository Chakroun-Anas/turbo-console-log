import type { TernaryLineTestCase } from '../types';

export const passingCase4: TernaryLineTestCase = {
  name: 'ternary inside function',
  fileExtension: 'php',
  lines: [
    '<?php',
    'function getStatus($active) {',
    '    $status = $active ? "enabled" : "disabled";',
    '    return $status;',
    '}',
  ],
  selectionLine: 2,
  variableName: '$status',
  expectedLine: 3,
};
