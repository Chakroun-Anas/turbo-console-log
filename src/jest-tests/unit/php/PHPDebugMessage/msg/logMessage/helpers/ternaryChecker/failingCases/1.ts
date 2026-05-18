import type { TernaryCheckerTestCase } from '../types';

export const failingCase1: TernaryCheckerTestCase = {
  name: 'primitive assignment should not match',
  fileExtension: 'php',
  lines: ['<?php', '$result = "value";'],
  selectionLine: 1,
  variableName: '$result',
};
