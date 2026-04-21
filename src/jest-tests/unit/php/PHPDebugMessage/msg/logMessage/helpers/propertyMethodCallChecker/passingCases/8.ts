import type { PropertyMethodCallCheckerTestCase } from '../types';

export const passingCase8: PropertyMethodCallCheckerTestCase = {
  name: 'Laravel-style chaining - User::where()->first()->name',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$user = User::where("id", 1)->first()->getAttribute("name");',
  ],
  selectionLine: 1,
  variableName: 'User::where("id", 1)',
};
