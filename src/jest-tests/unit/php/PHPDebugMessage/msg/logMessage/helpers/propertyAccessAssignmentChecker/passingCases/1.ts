import type { PropertyAccessAssignmentCheckerTestCase } from '../types';

export default {
  name: 'simple property access assignment',
  fileExtension: '.php',
  lines: ['<?php', '$name = $user->name;'],
  selectionLine: 1,
  variableName: '$name',
} satisfies PropertyAccessAssignmentCheckerTestCase;
