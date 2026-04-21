import type { TernaryCheckerTestCase } from '../types';

export const passingCase8: TernaryCheckerTestCase = {
  name: 'ternary with complex condition',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$message = ($count > 0 && $isActive) ? "Available" : "Unavailable";',
  ],
  selectionLine: 1,
  variableName: '$message',
};
