import { ArrayAssignmentLineTestCase } from '../types';

export const passingCase2: ArrayAssignmentLineTestCase = {
  name: 'short array syntax []',
  fileExtension: 'php',
  lines: ['<?php', '$numbers = [1, 2, 3, 4];', 'print_r($numbers);'],
  selectionLine: 1,
  variableName: '$numbers',
  expectedLine: 2,
};
