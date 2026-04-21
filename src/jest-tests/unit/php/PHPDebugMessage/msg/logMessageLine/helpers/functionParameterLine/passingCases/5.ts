import type { FunctionParameterLineTestCase } from '../types';

export default {
  name: 'arrow function parameter',
  fileExtension: '.php',
  lines: ['<?php', '$double = fn($x) => $x * 2;'],
  selectionLine: 1,
  variableName: '$x',
  expectedLine: 2,
} satisfies FunctionParameterLineTestCase;
