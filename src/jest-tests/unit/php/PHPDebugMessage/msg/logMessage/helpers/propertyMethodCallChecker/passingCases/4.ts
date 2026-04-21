import type { PropertyMethodCallCheckerTestCase } from '../types';

export const passingCase4: PropertyMethodCallCheckerTestCase = {
  name: 'array access with method call - $users[0]->getName()',
  fileExtension: 'php',
  lines: ['<?php', '$name = $users[0]->getName();'],
  selectionLine: 1,
  variableName: '$users[0]',
};
