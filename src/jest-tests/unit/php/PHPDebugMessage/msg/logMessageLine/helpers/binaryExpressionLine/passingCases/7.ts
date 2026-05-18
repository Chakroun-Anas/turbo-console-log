import type { BinaryExpressionLineTestCase } from '../types';

export default {
  name: 'comparison expression',
  fileExtension: '.php',
  lines: ['<?php', '$isValid = $age >= 18;'],
  selectionLine: 1,
  variableName: '$isValid',
  expectedLine: 2,
} satisfies BinaryExpressionLineTestCase;
