export default {
  name: 'ternary inside variable with type annotation',
  fileExtension: '.ts',
  lines: ["const mode: string = isDark ? 'dark' : 'light';", 'init(mode);'],
  selectionLine: 0,
  variableName: 'mode',
  expectedLine: 1,
};
