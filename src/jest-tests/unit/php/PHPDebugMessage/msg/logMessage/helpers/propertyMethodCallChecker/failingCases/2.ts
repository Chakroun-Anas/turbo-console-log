import type { PropertyMethodCallCheckerTestCase } from '../types';

export const failingCase2: PropertyMethodCallCheckerTestCase = {
  name: 'array assignment',
  fileExtension: 'php',
  lines: ['<?php', '$items = [1, 2, 3];'],
  selectionLine: 1,
  variableName: '$items',
};
