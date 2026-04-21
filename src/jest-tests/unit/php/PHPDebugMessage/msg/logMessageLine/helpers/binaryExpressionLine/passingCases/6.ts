import type { BinaryExpressionLineTestCase } from '../types';

export default {
  name: 'multi-line logical OR expression',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$canAccess = $isAdmin',
    '  || $isOwner',
    '  || $isModerator;',
  ],
  selectionLine: 1,
  variableName: '$canAccess',
  expectedLine: 4,
} satisfies BinaryExpressionLineTestCase;
