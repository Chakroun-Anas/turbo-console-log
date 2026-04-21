import type { PropertyMethodCallCheckerTestCase } from '../types';

export const failingCase1: PropertyMethodCallCheckerTestCase = {
  name: 'primitive variable assignment',
  fileExtension: 'php',
  lines: ['<?php', '$name = $value;'],
  selectionLine: 1,
  variableName: '$value',
};
