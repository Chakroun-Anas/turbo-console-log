import { ArrayAssignmentLineTestCase } from '../types';

export const passingCase1: ArrayAssignmentLineTestCase = {
  name: 'simple array assignment with array()',
  fileExtension: 'php',
  lines: ['<?php', '$data = array(1, 2, 3);', 'echo $data;'],
  selectionLine: 1,
  variableName: '$data',
  expectedLine: 2,
};
