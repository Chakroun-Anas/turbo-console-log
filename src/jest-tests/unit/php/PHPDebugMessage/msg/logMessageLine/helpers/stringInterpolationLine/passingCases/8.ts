import type { StringInterpolationLineTestCase } from '../types';

export default {
  name: 'interpolation with path-like string',
  fileExtension: '.php',
  lines: ['<?php', '$path = "/users/$userId/profile";'],
  selectionLine: 1,
  variableName: '$path',
  expectedLine: 2,
} satisfies StringInterpolationLineTestCase;
