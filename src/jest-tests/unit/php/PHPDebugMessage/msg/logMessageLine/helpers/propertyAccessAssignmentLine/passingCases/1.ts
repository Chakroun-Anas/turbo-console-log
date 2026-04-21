import type { PropertyAccessAssignmentLineTestCase } from '../types';

export default {
  name: 'simple property access assignment',
  fileExtension: '.php',
  lines: ['<?php', '$name = $user->name;'],
  selectionLine: 1,
  variableName: '$name',
  expectedLine: 2,
} satisfies PropertyAccessAssignmentLineTestCase;
