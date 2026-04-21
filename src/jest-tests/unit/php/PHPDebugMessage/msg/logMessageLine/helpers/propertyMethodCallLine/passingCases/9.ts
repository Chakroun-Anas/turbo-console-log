import type { PropertyMethodCallLineTestCase } from '../types';

export default {
  name: 'chaining after assignment with multiple lines',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$result = $repository',
    '  ->findById($id)',
    '  ->load("relationships")',
    '  ->toArray();',
  ],
  selectionLine: 2,
  variableName: '$repository->findById($id)',
  expectedLine: 5,
} satisfies PropertyMethodCallLineTestCase;
