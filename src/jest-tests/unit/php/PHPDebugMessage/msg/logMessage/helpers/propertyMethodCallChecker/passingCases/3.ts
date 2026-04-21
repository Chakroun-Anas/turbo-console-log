import type { PropertyMethodCallCheckerTestCase } from '../types';

export const passingCase3: PropertyMethodCallCheckerTestCase = {
  name: 'three-level chaining - $product->getCategory()->getName()->trim()',
  fileExtension: 'php',
  lines: ['<?php', '$name = $product->getCategory()->getName()->trim();'],
  selectionLine: 1,
  variableName: '$product->getCategory()->getName()',
};
