import type { PropertyMethodCallCheckerTestCase } from '../types';

export const passingCase6: PropertyMethodCallCheckerTestCase = {
  name: 'fluent interface - $builder->select()->from()->where()->execute()',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$data = $builder->select("*")->from("users")->where("active", 1)->execute();',
  ],
  selectionLine: 1,
  variableName: '$builder->select("*")',
};
