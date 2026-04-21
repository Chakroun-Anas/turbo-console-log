import type { PropertyAccessAssignmentCheckerTestCase } from '../types';

export default {
  name: 'property access from method result',
  fileExtension: '.php',
  lines: ['<?php', '$name = $this->getUser()->name;'],
  selectionLine: 1,
  variableName: '$name',
} satisfies PropertyAccessAssignmentCheckerTestCase;
