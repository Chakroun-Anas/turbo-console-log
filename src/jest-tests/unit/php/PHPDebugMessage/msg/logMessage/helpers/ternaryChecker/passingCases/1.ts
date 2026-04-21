import type { TernaryCheckerTestCase } from '../types';

export const passingCase1: TernaryCheckerTestCase = {
  name: 'simple ternary assignment',
  fileExtension: 'php',
  lines: ['<?php', '$result = $isActive ? "yes" : "no";'],
  selectionLine: 1,
  variableName: '$result',
};
