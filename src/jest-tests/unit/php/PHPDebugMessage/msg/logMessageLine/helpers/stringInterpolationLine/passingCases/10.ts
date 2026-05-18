import type { StringInterpolationLineTestCase } from '../types';

export default {
  name: 'concatenation with interpolation over lines',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$message = "Hello $firstName"',
    '  . " $lastName,',
    '  welcome!";',
  ],
  selectionLine: 1,
  variableName: '$message',
  expectedLine: 4,
} satisfies StringInterpolationLineTestCase;
