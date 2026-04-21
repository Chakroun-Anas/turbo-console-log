import type { ObjectFunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'standalone function call (not a method)',
  fileExtension: '.php',
  lines: ['<?php', '$result = getUser($id);'],
  selectionLine: 1,
  variableName: '$result',
} satisfies ObjectFunctionCallAssignmentCheckerTestCase;
