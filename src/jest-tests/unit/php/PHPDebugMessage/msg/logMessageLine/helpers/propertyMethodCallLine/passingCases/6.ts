import type { PropertyMethodCallLineTestCase } from '../types';

export default {
  name: 'array access with method chaining',
  fileExtension: '.php',
  lines: ['<?php', '$name = $users[0]->getName()->toUpperCase();'],
  selectionLine: 1,
  variableName: '$users[0]->getName()',
  expectedLine: 2,
} satisfies PropertyMethodCallLineTestCase;
