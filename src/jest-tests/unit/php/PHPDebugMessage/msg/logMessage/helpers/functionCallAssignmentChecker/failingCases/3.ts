import type { FunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'property access without call should not match',
  fileExtension: '.php',
  lines: ['<?php', '$value = $obj->property;'],
  selectionLine: 1,
  variableName: '$value',
} satisfies FunctionCallAssignmentCheckerTestCase;
