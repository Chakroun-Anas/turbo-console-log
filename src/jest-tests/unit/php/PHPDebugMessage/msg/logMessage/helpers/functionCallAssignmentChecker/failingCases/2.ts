import type { FunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'array assignment should not match',
  fileExtension: '.php',
  lines: ['<?php', '$arr = [1, 2, 3];'],
  selectionLine: 1,
  variableName: '$arr',
} satisfies FunctionCallAssignmentCheckerTestCase;
