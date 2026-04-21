import type { FunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'built-in function call',
  fileExtension: '.php',
  lines: ['<?php', '$count = count($array);'],
  selectionLine: 1,
  variableName: '$count',
} satisfies FunctionCallAssignmentCheckerTestCase;
