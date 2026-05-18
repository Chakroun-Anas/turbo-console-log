import type { TernaryCheckerTestCase } from '../types';

export const passingCase11: TernaryCheckerTestCase = {
  name: 'ternary with method chaining in condition',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$output = $user->isAdmin() ? $user->getAdminPanel() : $user->getDefaultView();',
  ],
  selectionLine: 1,
  variableName: '$output',
};
