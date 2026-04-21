import type { PropertyAccessAssignmentLineTestCase } from '../types';

export default {
  name: 'chained property access',
  fileExtension: '.php',
  lines: ['<?php', '$city = $user->address->city;'],
  selectionLine: 1,
  variableName: '$city',
  expectedLine: 2,
} satisfies PropertyAccessAssignmentLineTestCase;
