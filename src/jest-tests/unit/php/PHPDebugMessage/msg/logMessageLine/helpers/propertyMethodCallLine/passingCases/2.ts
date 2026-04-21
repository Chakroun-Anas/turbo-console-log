import type { PropertyMethodCallLineTestCase } from '../types';

export default {
  name: 'nested property with method call',
  fileExtension: '.php',
  lines: ['<?php', '$email = $order->getUser()->getEmail();'],
  selectionLine: 1,
  variableName: '$order->getUser()',
  expectedLine: 2,
} satisfies PropertyMethodCallLineTestCase;
