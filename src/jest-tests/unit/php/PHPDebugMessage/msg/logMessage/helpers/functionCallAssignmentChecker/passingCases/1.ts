import type { FunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'simple function call assignment',
  fileExtension: '.php',
  lines: ['<?php', '$result = getUser($id);'],
  selectionLine: 1,
  variableName: '$result',
} satisfies FunctionCallAssignmentCheckerTestCase;
