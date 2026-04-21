import type { FunctionParameterCheckerTestCase } from '../types';

export default {
  name: 'function with many parameters and type hints across multiple lines',
  fileExtension: '.php',
  lines: [
    '<?php',
    'function processOrder(',
    '  string $orderId,',
    '  array $items,',
    '  float $total,',
    '  bool $isPaid = false,',
    '  ?string $couponCode = null',
    ') {',
    '  return $items;',
    '}',
  ],
  selectionLine: 1,
  variableName: '$items',
} satisfies FunctionParameterCheckerTestCase;
