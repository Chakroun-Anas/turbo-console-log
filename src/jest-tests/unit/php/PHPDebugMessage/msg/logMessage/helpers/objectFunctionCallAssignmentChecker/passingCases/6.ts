import type { ObjectFunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'multi-line method call',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$response = $client',
    '  ->setHeaders($headers)',
    '  ->fetch($url);',
  ],
  selectionLine: 1,
  variableName: '$response',
} satisfies ObjectFunctionCallAssignmentCheckerTestCase;
