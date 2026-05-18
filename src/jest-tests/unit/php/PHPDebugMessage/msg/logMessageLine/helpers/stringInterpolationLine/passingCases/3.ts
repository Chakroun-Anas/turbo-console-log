import type { StringInterpolationLineTestCase } from '../types';

export default {
  name: 'property access interpolation',
  fileExtension: '.php',
  lines: ['<?php', '$info = "Name: $user->name";'],
  selectionLine: 1,
  variableName: '$info',
  expectedLine: 2,
} satisfies StringInterpolationLineTestCase;
