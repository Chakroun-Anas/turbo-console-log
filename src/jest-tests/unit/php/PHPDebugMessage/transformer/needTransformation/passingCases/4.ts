export default {
  name: 'arrow function using variable in body',
  lines: [
    '<?php',
    '$users = ["Alice", "Bob"];',
    '$upper = fn($name) => strtoupper($name);',
  ],
  selectionLine: 2,
  variableName: 'name',
};
