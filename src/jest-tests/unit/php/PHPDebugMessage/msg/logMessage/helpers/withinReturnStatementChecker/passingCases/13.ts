import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase13: WithinReturnStatementCheckerTestCase = {
  name: 'arrow function return',
  fileExtension: 'php',
  lines: ['<?php', '$fn = fn($x) => $x * 2;'],
  selectionLine: 1,
  variableName: '$x',
};
