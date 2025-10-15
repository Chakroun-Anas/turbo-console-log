export default {
  name: 'syntax error - missing closing brace',
  sourceCode: ['function broken() {', '  console.log("missing closing brace"'],
  expectedError: 'Failed to parse source code',
};
