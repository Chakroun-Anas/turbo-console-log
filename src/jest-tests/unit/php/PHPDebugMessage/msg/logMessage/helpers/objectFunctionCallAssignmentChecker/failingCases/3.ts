import type { ObjectFunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'primitive assignment',
  fileExtension: '.php',
  lines: ['<?php', '$count = 42;'],
  selectionLine: 1,
  variableName: '$count',
} satisfies ObjectFunctionCallAssignmentCheckerTestCase;
