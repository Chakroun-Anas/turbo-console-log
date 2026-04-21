import type { PropertyMethodCallCheckerTestCase } from '../types';

export const passingCase5: PropertyMethodCallCheckerTestCase = {
  name: 'method with parameters in chain - $query->where("active", true)->get()',
  fileExtension: 'php',
  lines: ['<?php', '$results = $query->where("active", true)->get();'],
  selectionLine: 1,
  variableName: '$query->where("active", true)',
};
