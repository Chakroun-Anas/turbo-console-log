import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase4: WithinReturnStatementCheckerTestCase = {
  name: 'return with array',
  fileExtension: 'php',
  lines: ['<?php', 'function getItems() {', '    return $items;', '}'],
  selectionLine: 2,
  variableName: '$items',
};
