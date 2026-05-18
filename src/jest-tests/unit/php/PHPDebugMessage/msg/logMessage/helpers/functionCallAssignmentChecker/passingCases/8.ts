import type { FunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'function call inside conditional block',
  fileExtension: '.php',
  lines: ['<?php', 'if (true) {', '  $result = getData();', '}'],
  selectionLine: 2,
  variableName: '$result',
} satisfies FunctionCallAssignmentCheckerTestCase;
