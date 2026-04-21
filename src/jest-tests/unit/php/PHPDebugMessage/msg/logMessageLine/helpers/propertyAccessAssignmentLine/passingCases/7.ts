import type { PropertyAccessAssignmentLineTestCase } from '../types';

export default {
  name: 'property access with dynamic property name',
  fileExtension: '.php',
  lines: ['<?php', '$value = $obj->$propertyName;'],
  selectionLine: 1,
  variableName: '$value',
  expectedLine: 2,
} satisfies PropertyAccessAssignmentLineTestCase;
