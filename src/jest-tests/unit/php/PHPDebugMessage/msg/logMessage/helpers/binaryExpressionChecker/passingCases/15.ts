export default {
  name: 'multi-line binary expression',
  fileExtension: '.php',
  lines: ['<?php', '$total = $basePrice', '  + $shipping', '  + $tax;'],
  selectionLine: 1,
  variableName: '$basePrice + $shipping + $tax',
};
