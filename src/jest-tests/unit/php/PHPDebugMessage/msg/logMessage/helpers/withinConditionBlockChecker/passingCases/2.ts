import type { WithinConditionBlockCheckerTestCase } from '../types';

export const passingCase2: WithinConditionBlockCheckerTestCase = {
  name: 'variable in elseif condition',
  fileExtension: 'php',
  lines: [
    '<?php',
    'if ($a > 10) {',
    '    echo "Greater";',
    '} elseif ($b < 5) {',
    '    echo "Less";',
    '}',
  ],
  selectionLine: 3,
  variableName: '$b',
};
