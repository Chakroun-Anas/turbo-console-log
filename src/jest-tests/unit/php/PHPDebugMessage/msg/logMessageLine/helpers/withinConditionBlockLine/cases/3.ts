import type { WithinConditionBlockLineTestCase } from '../types';

export const case3: WithinConditionBlockLineTestCase = {
  name: 'should insert before elseif block',
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
  expectedLine: 3,
};
