import type { PropertyAccessAssignmentCheckerTestCase } from '../types';

export default {
  name: 'method call assignment should not match',
  fileExtension: '.php',
  lines: ['<?php', '$data = $obj->getUser();'],
  selectionLine: 1,
  variableName: '$data',
} satisfies PropertyAccessAssignmentCheckerTestCase;
