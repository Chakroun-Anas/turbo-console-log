export default {
  name: 'multi-line ternary assignment',
  fileExtension: '.ts',
  lines: [
    'const argTargetDir = argv._[0]',
    '  ? formatTargetDir(String(argv._[0]))',
    '  : undefined;',
  ],
  selectionLine: 0,
  variableName: 'argTargetDir',
  expectedLine: 3,
};
