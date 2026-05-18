export default {
  name: 'single quote string (no interpolation)',
  fileExtension: '.php',
  lines: ['<?php', "$message = 'Hello $name';"],
  selectionLine: 1,
  variableName: "'Hello $name'",
};
