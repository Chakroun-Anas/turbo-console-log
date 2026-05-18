export default {
  name: 'wrong variable name',
  fileExtension: '.php',
  lines: ['<?php', '$name = "John";', '?>'],
  selectionLine: 1,
  variableName: '$age',
};
