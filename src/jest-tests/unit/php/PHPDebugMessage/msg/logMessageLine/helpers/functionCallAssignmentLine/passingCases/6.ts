import type { FunctionCallAssignmentLineTestCase } from '../types';

export default {
  name: 'multi-line static method call with array parameter',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$user = User::create([',
    '  "name" => "John",',
    '  "email" => "john@example.com",',
    '  "age" => 30',
    ']);',
  ],
  selectionLine: 1,
  variableName: '$user',
  expectedLine: 6,
} satisfies FunctionCallAssignmentLineTestCase;
