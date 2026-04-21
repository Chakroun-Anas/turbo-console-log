import type { PropertyMethodCallLineTestCase } from '../types';

export default {
  name: 'multi-line method chaining',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$profile = $user->getProfile()',
    '  ->getSettings()',
    '  ->getPreferences();',
  ],
  selectionLine: 1,
  variableName: '$user->getProfile()',
  expectedLine: 4,
} satisfies PropertyMethodCallLineTestCase;
