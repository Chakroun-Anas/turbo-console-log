import type { BinaryExpressionLineTestCase } from '../types';

export default {
  name: 'logical AND expression',
  fileExtension: '.php',
  lines: ['<?php', '$canProceed = $isActive && $hasPermission;'],
  selectionLine: 1,
  variableName: '$canProceed',
  expectedLine: 2,
} satisfies BinaryExpressionLineTestCase;
