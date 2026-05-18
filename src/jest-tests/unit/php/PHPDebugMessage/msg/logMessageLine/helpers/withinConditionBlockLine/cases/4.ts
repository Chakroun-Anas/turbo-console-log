import type { WithinConditionBlockLineTestCase } from '../types';

export const case4: WithinConditionBlockLineTestCase = {
  name: 'should insert before if with property access',
  fileExtension: 'php',
  lines: ['<?php', 'if ($user->isActive()) {', '    processUser($user);', '}'],
  selectionLine: 1,
  variableName: '$user->isActive',
  expectedLine: 1,
};
