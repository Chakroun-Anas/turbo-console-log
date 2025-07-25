export default {
  name: 'should insert before start of complex if block',
  lines: [
    'if (',
    '  process.env.GITHUB_ACTIONS === "true" &&',
    '  process.env.GITHUB_EVENT_NAME === "pull_request"',
    ') {',
    '  deployToPreview();',
    '}',
  ],
  selectionLine: 1,
  variableName: 'process.env.GITHUB_ACTIONS',
  expectedLine: 0,
};
