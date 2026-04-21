import type { FunctionCallAssignmentLineTestCase } from '../types';

export default {
  name: 'function call assignment with multiple statements on same line after',
  fileExtension: '.php',
  lines: ['<?php', '$result = getUser($id); $other = 5;'],
  selectionLine: 1,
  variableName: '$result',
  expectedLine: 2,
} satisfies FunctionCallAssignmentLineTestCase;
