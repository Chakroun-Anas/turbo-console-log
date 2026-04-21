import type { PropertyMethodCallLineTestCase } from '../types';

export default {
  name: 'three-level chaining',
  fileExtension: '.php',
  lines: ['<?php', '$trimmed = $product->getCategory()->getName()->trim();'],
  selectionLine: 1,
  variableName: '$product->getCategory()->getName()',
  expectedLine: 2,
} satisfies PropertyMethodCallLineTestCase;
