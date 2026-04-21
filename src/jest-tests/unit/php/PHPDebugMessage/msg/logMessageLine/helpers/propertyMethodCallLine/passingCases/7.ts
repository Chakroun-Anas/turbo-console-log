import type { PropertyMethodCallLineTestCase } from '../types';

export default {
  name: 'static method chaining',
  fileExtension: '.php',
  lines: ['<?php', '$user = User::where("id", 1)->first()->name;'],
  selectionLine: 1,
  variableName: 'User::where("id", 1)',
  expectedLine: 2,
} satisfies PropertyMethodCallLineTestCase;
