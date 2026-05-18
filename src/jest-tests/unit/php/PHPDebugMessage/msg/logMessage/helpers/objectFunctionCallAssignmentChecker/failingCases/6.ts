import type { ObjectFunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'property access then method call',
  fileExtension: '.php',
  lines: ['<?php', '$name = $this->getUser()->name;'],
  selectionLine: 1,
  variableName: '$name',
} satisfies ObjectFunctionCallAssignmentCheckerTestCase;
