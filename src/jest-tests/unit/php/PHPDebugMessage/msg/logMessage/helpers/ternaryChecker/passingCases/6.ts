import type { TernaryCheckerTestCase } from '../types';

export const passingCase6: TernaryCheckerTestCase = {
  name: 'ternary with array access',
  fileExtension: 'php',
  lines: ['<?php', '$item = isset($items[0]) ? $items[0] : null;'],
  selectionLine: 1,
  variableName: '$item',
};
