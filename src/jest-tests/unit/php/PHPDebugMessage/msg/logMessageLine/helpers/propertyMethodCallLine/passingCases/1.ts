import type { PropertyMethodCallLineTestCase } from '../types';

export default {
  name: 'simple method chaining on single line',
  fileExtension: '.php',
  lines: ['<?php', '$lower = $user->getName()->toLowerCase();'],
  selectionLine: 1,
  variableName: '$user->getName()',
  expectedLine: 2,
} satisfies PropertyMethodCallLineTestCase;
