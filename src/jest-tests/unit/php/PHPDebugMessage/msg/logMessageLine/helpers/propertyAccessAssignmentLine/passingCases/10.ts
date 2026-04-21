import type { PropertyAccessAssignmentLineTestCase } from '../types';

export default {
  name: 'complex multi-line property chain with mixed access',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$final = $app',
    '  ->getContainer()',
    '  ->get("service")',
    '  ->config',
    '  ->value;',
  ],
  selectionLine: 1,
  variableName: '$final',
  expectedLine: 6,
} satisfies PropertyAccessAssignmentLineTestCase;
