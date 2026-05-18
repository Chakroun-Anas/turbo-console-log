import type { StringInterpolationLineTestCase } from '../types';

export default {
  name: 'multiple variables interpolation',
  fileExtension: '.php',
  lines: ['<?php', '$message = "User $name has $count items";'],
  selectionLine: 1,
  variableName: '$message',
  expectedLine: 2,
} satisfies StringInterpolationLineTestCase;
