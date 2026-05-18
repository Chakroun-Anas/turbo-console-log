import type { WithinReturnStatementLineTestCase } from '../types';

export const passingCase3: WithinReturnStatementLineTestCase = {
  name: 'return with function call',
  fileExtension: 'php',
  lines: ['<?php', 'function process() {', '    return getData($id);', '}'],
  selectionLine: 2,
  variableName: 'getData($id)',
  expectedLine: 2,
};
