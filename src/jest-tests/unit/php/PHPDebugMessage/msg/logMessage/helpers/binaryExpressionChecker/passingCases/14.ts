export default {
  name: 'null coalescing with multi-line',
  fileExtension: '.php',
  lines: ['<?php', '$value = $input', '  ?? $fallback', '  ?? $default;'],
  selectionLine: 1,
  variableName: '$input ?? $fallback ?? $default',
};
