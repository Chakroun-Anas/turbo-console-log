import type { BinaryExpressionLineTestCase } from '../types';

export default {
  name: 'multi-line arithmetic expression',
  fileExtension: '.php',
  lines: ['<?php', '$total = $basePrice', '  + $shipping', '  + $tax;'],
  selectionLine: 1,
  variableName: '$total',
  expectedLine: 4,
} satisfies BinaryExpressionLineTestCase;
