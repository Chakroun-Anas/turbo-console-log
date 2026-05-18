import type { PropertyAccessAssignmentCheckerTestCase } from '../types';

export default {
  name: 'variable assignment should not match',
  fileExtension: '.php',
  lines: ['<?php', '$a = $b;'],
  selectionLine: 1,
  variableName: '$a',
} satisfies PropertyAccessAssignmentCheckerTestCase;
