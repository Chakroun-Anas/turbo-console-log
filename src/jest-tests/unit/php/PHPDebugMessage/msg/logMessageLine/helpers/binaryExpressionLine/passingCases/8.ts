import type { BinaryExpressionLineTestCase } from '../types';

export default {
  name: 'null coalescing operator',
  fileExtension: '.php',
  lines: ['<?php', '$value = $input ?? $default;'],
  selectionLine: 1,
  variableName: '$value',
  expectedLine: 2,
} satisfies BinaryExpressionLineTestCase;
