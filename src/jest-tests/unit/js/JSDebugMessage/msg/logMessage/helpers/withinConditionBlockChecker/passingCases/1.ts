export default {
  name: 'should detect property access in if condition',
  fileExtension: '.ts',
  lines: [
    'if (process.env.GITHUB_ACTIONS === "true") {',
    '  console.log("In GitHub Actions");',
    '}',
  ],
  selectionLine: 0,
  variableName: 'process.env.GITHUB_ACTIONS',
  expected: true,
};
