import { ArrayAssignmentLineTestCase } from '../types';

export const passingCase10: ArrayAssignmentLineTestCase = {
  name: 'array assignment with multiple statements on same line after',
  fileExtension: 'php',
  lines: ['<?php', '$values = [1, 2]; $total = 0;', 'echo $total;'],
  selectionLine: 1,
  variableName: '$values',
  expectedLine: 2,
};
