export default {
  name: 'identifier reassigned to a multi-line ternary',
  lines: ['let mode;', 'mode = dark', "  ? 'dark'", "  : 'light';", 'next();'],
  fileExtension: '.ts',
  selectionLine: 1,
  variableName: 'mode',
  expectedLine: 4,
};
