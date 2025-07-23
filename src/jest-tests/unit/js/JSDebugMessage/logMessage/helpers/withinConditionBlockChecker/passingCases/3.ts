export default {
  name: 'should handle nested property access',
  lines: [
    'if (app.config.database.host === "localhost") {',
    '  connectToLocal();',
    '}',
  ],
  selectionLine: 0,
  variableName: 'app.config.database.host',
  expected: true,
};
