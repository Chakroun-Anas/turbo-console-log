import type { FunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'function with multiple parameters',
  fileExtension: '.php',
  lines: ['<?php', '$sum = add($a, $b, $c);'],
  selectionLine: 1,
  variableName: '$sum',
} satisfies FunctionCallAssignmentCheckerTestCase;
