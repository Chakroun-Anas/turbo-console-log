import type { FunctionCallAssignmentLineTestCase } from '../types';

export default {
  name: 'multi-line method call with chaining',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$data = $repository',
    '  ->where("status", "active")',
    '  ->orderBy("created_at")',
    '  ->get();',
  ],
  selectionLine: 1,
  variableName: '$data',
  expectedLine: 5,
} satisfies FunctionCallAssignmentLineTestCase;
