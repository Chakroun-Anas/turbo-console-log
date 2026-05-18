import type { StringInterpolationLineTestCase } from '../types';

export default {
  name: 'simple variable interpolation',
  fileExtension: '.php',
  lines: ['<?php', '$greeting = "Hello $name";'],
  selectionLine: 1,
  variableName: '$greeting',
  expectedLine: 2,
} satisfies StringInterpolationLineTestCase;
