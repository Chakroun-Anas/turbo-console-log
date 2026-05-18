import type { FunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'function call without assignment should not match',
  fileExtension: '.php',
  lines: ['<?php', 'getData();'],
  selectionLine: 1,
  variableName: 'getData',
} satisfies FunctionCallAssignmentCheckerTestCase;
