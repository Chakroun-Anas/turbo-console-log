export default {
  name: 'ternary in other var inside same object scope',
  fileExtension: '.ts',
  lines: [
    'const props = {',
    "  title: 'Hello',",
    '  color: theme === "dark" ? "#000" : "#fff",',
    '};',
  ],
  selectionLine: 1,
  variableName: 'title',
};
