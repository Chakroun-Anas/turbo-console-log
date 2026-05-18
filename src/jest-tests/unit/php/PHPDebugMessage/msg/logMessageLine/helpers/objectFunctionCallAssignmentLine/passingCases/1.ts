import type { ObjectFunctionCallAssignmentLineTestCase } from '../types';

export default {
  name: 'simple method call on object',
  fileExtension: '.php',
  lines: ['<?php', '$data = $obj->getUser();'],
  selectionLine: 1,
  variableName: '$data',
  expectedLine: 2,
} satisfies ObjectFunctionCallAssignmentLineTestCase;
