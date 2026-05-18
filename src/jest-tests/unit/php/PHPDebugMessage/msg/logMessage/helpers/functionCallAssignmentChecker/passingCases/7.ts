import type { FunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'namespaced function call',
  fileExtension: '.php',
  lines: ['<?php', '$result = \\Namespace\\MyClass::create();'],
  selectionLine: 1,
  variableName: '$result',
} satisfies FunctionCallAssignmentCheckerTestCase;
