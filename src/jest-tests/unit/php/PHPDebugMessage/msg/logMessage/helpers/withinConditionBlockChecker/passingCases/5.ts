import type { WithinConditionBlockCheckerTestCase } from '../types';

export const passingCase5: WithinConditionBlockCheckerTestCase = {
  name: 'variable in switch condition',
  fileExtension: 'php',
  lines: [
    '<?php',
    'switch ($status) {',
    '    case "active":',
    '        echo "Active";',
    '        break;',
    '}',
  ],
  selectionLine: 1,
  variableName: '$status',
};
