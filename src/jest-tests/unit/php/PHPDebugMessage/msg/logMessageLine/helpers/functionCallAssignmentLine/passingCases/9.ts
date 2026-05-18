import type { FunctionCallAssignmentLineTestCase } from '../types';

export default {
  name: 'function call with closure parameter spanning multiple lines',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$filtered = array_filter($items, function($item) {',
    '  return $item > 10;',
    '});',
  ],
  selectionLine: 1,
  variableName: '$filtered',
  expectedLine: 4,
} satisfies FunctionCallAssignmentLineTestCase;
