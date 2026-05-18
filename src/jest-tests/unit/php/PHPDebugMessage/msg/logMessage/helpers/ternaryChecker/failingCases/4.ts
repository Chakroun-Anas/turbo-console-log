import type { TernaryCheckerTestCase } from '../types';

export const failingCase4: TernaryCheckerTestCase = {
  name: 'property access assignment should not match',
  fileExtension: 'php',
  lines: ['<?php', '$name = $user->name;'],
  selectionLine: 1,
  variableName: '$name',
};
