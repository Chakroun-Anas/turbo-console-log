import type { ObjectFunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'method call with arguments',
  fileExtension: '.php',
  lines: ['<?php', '$result = $api->fetch("/data", $options);'],
  selectionLine: 1,
  variableName: '$result',
} satisfies ObjectFunctionCallAssignmentCheckerTestCase;
