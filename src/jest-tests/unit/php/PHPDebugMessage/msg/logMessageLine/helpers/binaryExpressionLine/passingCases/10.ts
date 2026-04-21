import type { BinaryExpressionLineTestCase } from '../types';

export default {
  name: 'bitwise operations',
  fileExtension: '.php',
  lines: ['<?php', '$flags = $permissions', '  & $mask', '  | $defaults;'],
  selectionLine: 1,
  variableName: '$flags',
  expectedLine: 4,
} satisfies BinaryExpressionLineTestCase;
