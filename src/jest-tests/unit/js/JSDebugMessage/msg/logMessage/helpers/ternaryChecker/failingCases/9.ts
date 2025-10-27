export default {
  name: 'function call with ternary inside, wrong variable',
  fileExtension: '.ts',
  lines: [
    "const formatted = formatText(cond ? 'bold' : 'light');",
    "const type = 'standard';",
  ],
  selectionLine: 1,
  variableName: 'type',
};
