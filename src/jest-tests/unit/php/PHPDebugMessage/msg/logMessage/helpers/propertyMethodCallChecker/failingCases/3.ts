import type { PropertyMethodCallCheckerTestCase } from '../types';

export const failingCase3: PropertyMethodCallCheckerTestCase = {
  name: 'function call assignment (not method call)',
  fileExtension: 'php',
  lines: ['<?php', '$name = getName($user);'],
  selectionLine: 1,
  variableName: '$name',
};
