import type { PropertyMethodCallCheckerTestCase } from '../types';

export const passingCase7: PropertyMethodCallCheckerTestCase = {
  name: 'multi-line method chaining',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$result = $user',
    '    ->getProfile()',
    '    ->getSettings()',
    '    ->getTheme();',
  ],
  selectionLine: 2,
  variableName: '$user->getProfile()',
};
