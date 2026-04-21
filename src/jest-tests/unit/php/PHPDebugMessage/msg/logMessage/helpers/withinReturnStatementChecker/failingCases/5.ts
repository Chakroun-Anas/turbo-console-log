import type { WithinReturnStatementCheckerTestCase } from '../types';

export const failingCase5: WithinReturnStatementCheckerTestCase = {
  name: 'wrong variable name should not match',
  fileExtension: 'php',
  lines: ['<?php', 'function get() {', '    return $user;', '}'],
  selectionLine: 2,
  variableName: '$admin',
};
