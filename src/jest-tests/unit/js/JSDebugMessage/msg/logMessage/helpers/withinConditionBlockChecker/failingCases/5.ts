export default {
  name: 'should not detect when selection is outside condition',
  lines: [
    'if (process.env.GITHUB_ACTIONS === "true") {',
    '  console.log("Inside block");',
    '}',
  ],
  selectionLine: 1,
  variableName: 'process.env.GITHUB_ACTIONS',
  expected: false,
};
