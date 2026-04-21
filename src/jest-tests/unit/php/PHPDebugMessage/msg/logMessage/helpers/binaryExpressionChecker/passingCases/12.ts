export default {
  name: 'bitwise operations with multi-line',
  fileExtension: '.php',
  lines: ['<?php', '$flags = $permissions', '  & $mask', '  | $defaults;'],
  selectionLine: 1,
  variableName: '$permissions & $mask | $defaults',
};
