import type { FunctionParameterCheckerTestCase } from '../types';

export default {
  name: 'variable inside function body should not match',
  fileExtension: '.php',
  lines: [
    '<?php',
    'function test() {',
    '  $localVar = 10;',
    '  return $localVar;',
    '}',
  ],
  selectionLine: 2,
  variableName: '$localVar',
} satisfies FunctionParameterCheckerTestCase;
