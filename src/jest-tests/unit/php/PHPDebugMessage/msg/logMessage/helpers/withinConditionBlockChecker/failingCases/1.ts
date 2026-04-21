import type { WithinConditionBlockCheckerTestCase } from '../types';

export const failingCase1: WithinConditionBlockCheckerTestCase = {
  name: 'variable assignment should not match',
  fileExtension: 'php',
  lines: ['<?php', '$result = $value + 10;'],
  selectionLine: 1,
  variableName: '$value',
};
