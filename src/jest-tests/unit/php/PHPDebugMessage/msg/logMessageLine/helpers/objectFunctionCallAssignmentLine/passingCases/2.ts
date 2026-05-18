import type { ObjectFunctionCallAssignmentLineTestCase } from '../types';

export default {
  name: 'chained method calls',
  fileExtension: '.php',
  lines: ['<?php', '$result = $obj->method1()->method2();'],
  selectionLine: 1,
  variableName: '$result',
  expectedLine: 2,
} satisfies ObjectFunctionCallAssignmentLineTestCase;
