import type { FunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'static method call',
  fileExtension: '.php',
  lines: ['<?php', '$value = ClassName::staticMethod();'],
  selectionLine: 1,
  variableName: '$value',
} satisfies FunctionCallAssignmentCheckerTestCase;
