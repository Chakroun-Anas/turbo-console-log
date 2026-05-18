import type { WithinReturnStatementCheckerTestCase } from '../types';

export const failingCase2: WithinReturnStatementCheckerTestCase = {
  name: 'echo statement should not match',
  fileExtension: 'php',
  lines: ['<?php', 'function display() {', '    echo $message;', '}'],
  selectionLine: 2,
  variableName: '$message',
};
