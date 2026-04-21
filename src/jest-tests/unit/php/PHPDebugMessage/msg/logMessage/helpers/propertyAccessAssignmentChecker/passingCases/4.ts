import type { PropertyAccessAssignmentCheckerTestCase } from '../types';

export default {
  name: 'property access from array element',
  fileExtension: '.php',
  lines: ['<?php', '$name = $users[0]->name;'],
  selectionLine: 1,
  variableName: '$name',
} satisfies PropertyAccessAssignmentCheckerTestCase;
