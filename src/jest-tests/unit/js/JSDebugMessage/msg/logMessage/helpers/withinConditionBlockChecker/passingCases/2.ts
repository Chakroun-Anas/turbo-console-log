export default {
  name: 'should detect property access in complex if condition',
  lines: [
    'if (',
    '  process.env.GITHUB_ACTIONS === "true" &&',
    '  process.env.GITHUB_EVENT_NAME === "pull_request"',
    ') {',
    '  console.log("Complex condition");',
    '}',
  ],
  selectionLine: 1,
  variableName: 'process.env.GITHUB_ACTIONS',
  expected: true,
};
