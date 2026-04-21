import type { StringInterpolationLineTestCase } from '../types';

export default {
  name: 'multi-line interpolation',
  fileExtension: '.php',
  lines: ['<?php', '$text = "Hello $name,', 'Welcome to $site";'],
  selectionLine: 1,
  variableName: '$text',
  expectedLine: 3,
} satisfies StringInterpolationLineTestCase;
