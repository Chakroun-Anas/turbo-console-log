import type { PropertyAccessAssignmentCheckerTestCase } from '../types';

export default {
  name: 'this property access',
  fileExtension: '.php',
  lines: ['<?php', '$value = $this->property;'],
  selectionLine: 1,
  variableName: '$value',
} satisfies PropertyAccessAssignmentCheckerTestCase;
