import type { ObjectFunctionCallAssignmentLineTestCase } from '../types';

export default {
  name: 'multi-line method call chain',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$response = $client',
    '  ->setHeaders($headers)',
    '  ->fetch($url);',
  ],
  selectionLine: 1,
  variableName: '$response',
  expectedLine: 4,
} satisfies ObjectFunctionCallAssignmentLineTestCase;
