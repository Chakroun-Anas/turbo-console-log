export default {
  name: 'should insert before start of if block',
  lines: [
    'if (process.env.GITHUB_ACTIONS === "true") {',
    '  console.log("Existing code");',
    '}',
  ],
  selectionLine: 0,
  variableName: 'process.env.GITHUB_ACTIONS',
  expectedLine: 0,
};
