import type { PropertyAccessAssignmentCheckerTestCase } from '../types';

export default {
  name: 'chained property access',
  fileExtension: '.php',
  lines: ['<?php', '$city = $user->address->city;'],
  selectionLine: 1,
  variableName: '$city',
} satisfies PropertyAccessAssignmentCheckerTestCase;
