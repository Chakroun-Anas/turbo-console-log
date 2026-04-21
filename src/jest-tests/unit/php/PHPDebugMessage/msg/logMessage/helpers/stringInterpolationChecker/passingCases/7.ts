export default {
  name: 'complex curly brace expression',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$summary = "User {$user->getName()} has {$cart->getTotal()} items";',
  ],
  selectionLine: 1,
  variableName: '$summary',
};
