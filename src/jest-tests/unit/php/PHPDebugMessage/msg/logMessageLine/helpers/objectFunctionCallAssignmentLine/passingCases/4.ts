import type { ObjectFunctionCallAssignmentLineTestCase } from '../types';

export default {
  name: 'method call with arguments',
  fileExtension: '.php',
  lines: ['<?php', '$result = $api->fetch("/data", $options);'],
  selectionLine: 1,
  variableName: '$result',
  expectedLine: 2,
} satisfies ObjectFunctionCallAssignmentLineTestCase;
