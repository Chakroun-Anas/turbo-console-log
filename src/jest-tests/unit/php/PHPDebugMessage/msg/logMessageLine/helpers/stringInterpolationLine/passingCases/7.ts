import type { StringInterpolationLineTestCase } from '../types';

export default {
  name: 'complex method call interpolation',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$summary = "User {$user->getName()} has {$cart->getTotal()} items";',
  ],
  selectionLine: 1,
  variableName: '$summary',
  expectedLine: 2,
} satisfies StringInterpolationLineTestCase;
