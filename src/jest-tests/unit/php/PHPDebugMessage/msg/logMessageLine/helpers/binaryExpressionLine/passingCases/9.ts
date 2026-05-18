import type { BinaryExpressionLineTestCase } from '../types';

export default {
  name: 'complex multi-line concatenation',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$message = "Hello, "',
    '  . $name',
    '  . "! Welcome to "',
    '  . $siteName;',
  ],
  selectionLine: 1,
  variableName: '$message',
  expectedLine: 5,
} satisfies BinaryExpressionLineTestCase;
