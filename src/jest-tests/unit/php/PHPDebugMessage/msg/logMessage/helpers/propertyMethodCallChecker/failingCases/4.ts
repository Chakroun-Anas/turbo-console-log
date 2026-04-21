import type { PropertyMethodCallCheckerTestCase } from '../types';

export const failingCase4: PropertyMethodCallCheckerTestCase = {
  name: 'simple property access (not a method call)',
  fileExtension: 'php',
  lines: ['<?php', '$name = $user->name;'],
  selectionLine: 1,
  variableName: '$user->name',
};
