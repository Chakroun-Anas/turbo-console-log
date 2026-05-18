export default {
  name: 'multi-line interpolation',
  fileExtension: '.php',
  lines: ['<?php', '$text = "Hello $name,', 'Welcome to $site";'],
  selectionLine: 1,
  variableName: '$text',
};
