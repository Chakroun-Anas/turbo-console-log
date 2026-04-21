export default {
  fileExtension: '.php',
  name: 'multiple assignments on consecutive lines',
  lines: [
    '<?php',
    '$price = 19.99;',
    '$tax = 0.08;',
    '$total = $price + $tax;',
  ],
  selectionLine: 1,
  variableName: '$price',
  expectedLine: 2,
};
