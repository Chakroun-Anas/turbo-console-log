import type { BinaryExpressionLineTestCase } from '../types';

export default {
  name: 'string concatenation',
  fileExtension: '.php',
  lines: ['<?php', '$fullName = $firstName . " " . $lastName;'],
  selectionLine: 1,
  variableName: '$fullName',
  expectedLine: 2,
} satisfies BinaryExpressionLineTestCase;
