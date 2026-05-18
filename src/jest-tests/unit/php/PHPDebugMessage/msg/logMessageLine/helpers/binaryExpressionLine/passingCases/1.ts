import type { BinaryExpressionLineTestCase } from '../types';

export default {
  name: 'simple arithmetic expression',
  fileExtension: '.php',
  lines: ['<?php', '$total = $price + $tax;'],
  selectionLine: 1,
  variableName: '$total',
  expectedLine: 2,
} satisfies BinaryExpressionLineTestCase;
