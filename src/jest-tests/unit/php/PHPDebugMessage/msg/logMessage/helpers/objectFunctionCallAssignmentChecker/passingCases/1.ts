import type { ObjectFunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'simple method call on object',
  fileExtension: '.php',
  lines: ['<?php', '$data = $obj->getUser();'],
  selectionLine: 1,
  variableName: '$data',
} satisfies ObjectFunctionCallAssignmentCheckerTestCase;
