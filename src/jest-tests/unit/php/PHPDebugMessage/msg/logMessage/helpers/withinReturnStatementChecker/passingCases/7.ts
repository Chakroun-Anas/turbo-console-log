import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase7: WithinReturnStatementCheckerTestCase = {
  name: 'return with array access',
  fileExtension: 'php',
  lines: ['<?php', 'function getFirst() {', '    return $items[0];', '}'],
  selectionLine: 2,
  variableName: '$items[0]',
};
