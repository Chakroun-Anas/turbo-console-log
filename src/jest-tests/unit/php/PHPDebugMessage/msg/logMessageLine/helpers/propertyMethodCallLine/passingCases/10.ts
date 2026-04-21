import type { PropertyMethodCallLineTestCase } from '../types';

export default {
  name: 'complex nested chaining with assignment',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$data = $service',
    '  ->getClient()',
    '  ->request("POST", "/api/users")',
    '  ->getBody()',
    '  ->getContents();',
  ],
  selectionLine: 2,
  variableName: '$service->getClient()',
  expectedLine: 6,
} satisfies PropertyMethodCallLineTestCase;
