import type { FunctionCallAssignmentLineTestCase } from '../types';

export default {
  name: 'static method call',
  fileExtension: '.php',
  lines: ['<?php', '$value = ClassName::staticMethod();'],
  selectionLine: 1,
  variableName: '$value',
  expectedLine: 2,
} satisfies FunctionCallAssignmentLineTestCase;
