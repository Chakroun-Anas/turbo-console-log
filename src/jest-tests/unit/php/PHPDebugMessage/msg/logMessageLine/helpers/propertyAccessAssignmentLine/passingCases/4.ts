import type { PropertyAccessAssignmentLineTestCase } from '../types';

export default {
  name: 'multi-line chained property access',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$result = $user',
    '  ->profile',
    '  ->settings',
    '  ->theme;',
  ],
  selectionLine: 1,
  variableName: '$result',
  expectedLine: 5,
} satisfies PropertyAccessAssignmentLineTestCase;
