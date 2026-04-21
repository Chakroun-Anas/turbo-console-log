import type { FunctionCallAssignmentLineTestCase } from '../types';

export default {
  name: 'simple function call assignment',
  fileExtension: '.php',
  lines: ['<?php', '$result = getUser($id);'],
  selectionLine: 1,
  variableName: '$result',
  expectedLine: 2,
} satisfies FunctionCallAssignmentLineTestCase;
