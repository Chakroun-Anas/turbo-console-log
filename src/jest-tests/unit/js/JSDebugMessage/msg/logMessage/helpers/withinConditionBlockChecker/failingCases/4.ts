export default {
  name: 'should not detect when variable is not in condition',
  fileExtension: '.ts',
  lines: [
    'if (someOtherVariable === "true") {',
    '  console.log(process.env.GITHUB_ACTIONS);',
    '}',
  ],
  selectionLine: 1,
  variableName: 'process.env.GITHUB_ACTIONS',
  expected: false,
};
