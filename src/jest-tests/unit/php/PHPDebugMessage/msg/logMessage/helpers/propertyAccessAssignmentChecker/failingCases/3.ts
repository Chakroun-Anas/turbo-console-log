import type { PropertyAccessAssignmentCheckerTestCase } from '../types';

export default {
  name: 'function call assignment should not match',
  fileExtension: '.php',
  lines: ['<?php', '$result = getUser($id);'],
  selectionLine: 1,
  variableName: '$result',
} satisfies PropertyAccessAssignmentCheckerTestCase;
