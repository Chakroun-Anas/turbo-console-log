import type { FunctionParameterCheckerTestCase } from '../types';

export default {
  name: 'property access should not match',
  fileExtension: '.php',
  lines: ['<?php', '$name = $user->name;'],
  selectionLine: 1,
  variableName: '$name',
} satisfies FunctionParameterCheckerTestCase;
