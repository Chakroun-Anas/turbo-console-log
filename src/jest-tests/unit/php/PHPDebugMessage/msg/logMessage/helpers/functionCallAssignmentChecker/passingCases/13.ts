import type { FunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'function call with closure parameter',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$filtered = array_filter($items, function($item) {',
    '  return $item > 10;',
    '});',
  ],
  selectionLine: 1,
  variableName: '$filtered',
} satisfies FunctionCallAssignmentCheckerTestCase;
