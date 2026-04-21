import type { PropertyMethodCallLineTestCase } from '../types';

export default {
  name: 'builder pattern with multi-line',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$query = $builder->select("*")',
    '  ->from("users")',
    '  ->where("active", true)',
    '  ->execute();',
  ],
  selectionLine: 1,
  variableName: '$builder->select("*")',
  expectedLine: 5,
} satisfies PropertyMethodCallLineTestCase;
