import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase3: WithinReturnStatementCheckerTestCase = {
  name: 'return with function call',
  fileExtension: 'php',
  lines: ['<?php', 'function process() {', '    return getData($id);', '}'],
  selectionLine: 2,
  variableName: 'getData($id)',
};
