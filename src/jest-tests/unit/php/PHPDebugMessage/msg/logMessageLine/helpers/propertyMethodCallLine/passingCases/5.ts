import type { PropertyMethodCallLineTestCase } from '../types';

export default {
  name: 'Laravel fluent query builder',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$results = $query->where("active", true)',
    '  ->orderBy("created_at")',
    '  ->limit(10)',
    '  ->get();',
  ],
  selectionLine: 1,
  variableName: '$query->where("active", true)',
  expectedLine: 5,
} satisfies PropertyMethodCallLineTestCase;
