import type { TernaryCheckerTestCase } from '../types';

export const passingCase5: TernaryCheckerTestCase = {
  name: 'ternary with property access',
  fileExtension: 'php',
  lines: ['<?php', '$name = $user ? $user->name : "Guest";'],
  selectionLine: 1,
  variableName: '$name',
};
