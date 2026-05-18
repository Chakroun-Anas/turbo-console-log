import type { StringInterpolationLineTestCase } from '../types';

export default {
  name: 'curly brace syntax interpolation',
  fileExtension: '.php',
  lines: ['<?php', '$message = "Total: {$price}";'],
  selectionLine: 1,
  variableName: '$message',
  expectedLine: 2,
} satisfies StringInterpolationLineTestCase;
