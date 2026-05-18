import type { ObjectFunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'simple property access (no method call)',
  fileExtension: '.php',
  lines: ['<?php', '$name = $user->name;'],
  selectionLine: 1,
  variableName: '$name',
} satisfies ObjectFunctionCallAssignmentCheckerTestCase;
