import type { PropertyAccessAssignmentCheckerTestCase } from '../types';

export default {
  name: 'property access with dynamic property name from variable',
  fileExtension: '.php',
  lines: ['<?php', '$value = $obj->$propertyName;'],
  selectionLine: 1,
  variableName: '$value',
} satisfies PropertyAccessAssignmentCheckerTestCase;
