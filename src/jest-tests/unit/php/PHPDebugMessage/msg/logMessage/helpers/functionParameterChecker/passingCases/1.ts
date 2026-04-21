import type { FunctionParameterCheckerTestCase } from '../types';

export default {
  name: 'simple function parameter',
  fileExtension: '.php',
  lines: ['<?php', 'function getUser($userId) {', '  return $userId;', '}'],
  selectionLine: 1,
  variableName: '$userId',
} satisfies FunctionParameterCheckerTestCase;
