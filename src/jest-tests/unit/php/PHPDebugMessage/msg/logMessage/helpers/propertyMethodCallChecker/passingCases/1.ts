import type { PropertyMethodCallCheckerTestCase } from '../types';

export const passingCase1: PropertyMethodCallCheckerTestCase = {
  name: 'simple method chaining - $user->getName()->toLowerCase()',
  fileExtension: 'php',
  lines: ['<?php', '$result = $user->getName()->toLowerCase();'],
  selectionLine: 1,
  variableName: '$user->getName()',
};
