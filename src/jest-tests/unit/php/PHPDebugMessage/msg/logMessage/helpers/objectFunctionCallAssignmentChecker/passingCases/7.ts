import type { ObjectFunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'nested method call with complex chain',
  fileExtension: '.php',
  lines: ['<?php', '$value = $config->getSettings()->toString();'],
  selectionLine: 1,
  variableName: '$value',
} satisfies ObjectFunctionCallAssignmentCheckerTestCase;
