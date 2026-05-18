import type { PropertyAccessAssignmentCheckerTestCase } from '../types';

export default {
  name: 'property access inside conditional',
  fileExtension: '.php',
  lines: ['<?php', 'if (true) {', '  $email = $user->email;', '}'],
  selectionLine: 2,
  variableName: '$email',
} satisfies PropertyAccessAssignmentCheckerTestCase;
