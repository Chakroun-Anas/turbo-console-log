import type { PropertyAccessAssignmentLineTestCase } from '../types';

export default {
  name: 'this property access',
  fileExtension: '.php',
  lines: ['<?php', '$value = $this->property;'],
  selectionLine: 1,
  variableName: '$value',
  expectedLine: 2,
} satisfies PropertyAccessAssignmentLineTestCase;
