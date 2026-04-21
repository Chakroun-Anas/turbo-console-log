import type { PropertyAccessAssignmentLineTestCase } from '../types';

export default {
  name: 'property access assignment with multiple statements on same line after',
  fileExtension: '.php',
  lines: ['<?php', '$email = $user->email; $other = 5;'],
  selectionLine: 1,
  variableName: '$email',
  expectedLine: 2,
} satisfies PropertyAccessAssignmentLineTestCase;
