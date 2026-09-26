export default {
  fileExtension: '.ts',
  name: 'first declarator of a multi-line require list - after the whole list',
  lines: [
    "var fs = require('fs'),",
    "    path = require('path');",
    '',
    'module.exports = fs;',
  ],
  selectionLine: 0,
  variableName: 'fs',
  expectedLine: 2,
};
