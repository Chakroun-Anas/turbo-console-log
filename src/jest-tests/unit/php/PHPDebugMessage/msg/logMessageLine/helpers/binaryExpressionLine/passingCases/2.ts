import type { BinaryExpressionLineTestCase } from '../types';

export default {
  name: 'multiplication and division',
  fileExtension: '.php',
  lines: ['<?php', '$result = $width * $height / 2;'],
  selectionLine: 1,
  variableName: '$result',
  expectedLine: 2,
} satisfies BinaryExpressionLineTestCase;
