import type { PropertyMethodCallCheckerTestCase } from '../types';

export const passingCase2: PropertyMethodCallCheckerTestCase = {
  name: 'nested property with method call - $order->getUser()->getEmail()',
  fileExtension: 'php',
  lines: ['<?php', '$email = $order->getUser()->getEmail();'],
  selectionLine: 1,
  variableName: '$order->getUser()',
};
