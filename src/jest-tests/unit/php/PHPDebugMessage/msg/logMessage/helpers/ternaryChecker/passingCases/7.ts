import type { TernaryCheckerTestCase } from '../types';

export const passingCase7: TernaryCheckerTestCase = {
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
};
