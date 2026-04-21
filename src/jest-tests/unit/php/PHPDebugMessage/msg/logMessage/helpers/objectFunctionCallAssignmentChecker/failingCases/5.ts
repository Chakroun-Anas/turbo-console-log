import type { ObjectFunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'variable assignment',
  fileExtension: '.php',
  lines: ['<?php', '$result = $otherVar;'],
  selectionLine: 1,
  variableName: '$result',
} satisfies ObjectFunctionCallAssignmentCheckerTestCase;
