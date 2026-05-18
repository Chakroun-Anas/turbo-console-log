import type { TernaryLineTestCase } from '../types';

export const passingCase1: TernaryLineTestCase = {
  name: 'simple ternary assignment',
  fileExtension: 'php',
  lines: ['<?php', '$result = $isActive ? "yes" : "no";'],
  selectionLine: 1,
  variableName: '$result',
  expectedLine: 2,
};
