import type { FunctionParameterCheckerTestCase } from '../types';

export default {
  name: 'function parameter with default value',
  fileExtension: '.php',
  lines: ['<?php', 'function greet($name = "Guest") {', '  return $name;', '}'],
  selectionLine: 1,
  variableName: '$name',
} satisfies FunctionParameterCheckerTestCase;
