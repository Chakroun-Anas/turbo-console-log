import type { PropertyAccessAssignmentCheckerTestCase } from '../types';

export default {
  name: 'primitive assignment should not match',
  fileExtension: '.php',
  lines: ['<?php', '$x = 5;'],
  selectionLine: 1,
  variableName: '$x',
} satisfies PropertyAccessAssignmentCheckerTestCase;
