import type { ObjectFunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'method call on $this',
  fileExtension: '.php',
  lines: ['<?php', '$user = $this->getUser();'],
  selectionLine: 1,
  variableName: '$user',
} satisfies ObjectFunctionCallAssignmentCheckerTestCase;
