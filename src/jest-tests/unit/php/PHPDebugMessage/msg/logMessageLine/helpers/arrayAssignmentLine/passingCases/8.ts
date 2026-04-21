import { ArrayAssignmentLineTestCase } from '../types';

export const passingCase8: ArrayAssignmentLineTestCase = {
  name: 'empty array assignment',
  fileExtension: 'php',
  lines: ['<?php', '$empty = [];', 'array_push($empty, 1);'],
  selectionLine: 1,
  variableName: '$empty',
  expectedLine: 2,
};
