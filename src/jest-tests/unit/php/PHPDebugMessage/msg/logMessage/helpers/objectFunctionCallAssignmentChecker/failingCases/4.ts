import type { ObjectFunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'array assignment',
  fileExtension: '.php',
  lines: ['<?php', '$items = [1, 2, 3];'],
  selectionLine: 1,
  variableName: '$items',
} satisfies ObjectFunctionCallAssignmentCheckerTestCase;
