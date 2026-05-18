import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase12: WithinReturnStatementCheckerTestCase = {
  name: 'return with static method call',
  fileExtension: 'php',
  lines: ['<?php', 'function get() {', '    return User::find($id);', '}'],
  selectionLine: 2,
  variableName: 'User::find($id)',
};
