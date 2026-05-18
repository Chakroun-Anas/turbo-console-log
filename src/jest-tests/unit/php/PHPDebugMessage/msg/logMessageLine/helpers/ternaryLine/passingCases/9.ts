import type { TernaryLineTestCase } from '../types';

export const passingCase9: TernaryLineTestCase = {
  name: 'multi-line ternary with property access (4 lines)',
  fileExtension: 'php',
  lines: ['<?php', '$name = $user', '    ? $user->name', '    : "Guest";'],
  selectionLine: 1,
  variableName: '$name',
  expectedLine: 4,
};
