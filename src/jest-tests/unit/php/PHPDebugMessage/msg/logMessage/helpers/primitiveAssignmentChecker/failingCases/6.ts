export default {
  name: 'static property access assignment',
  fileExtension: '.php',
  lines: ['<?php', '$value = User::$count;', '?>'],
  selectionLine: 1,
  variableName: '$value',
};
