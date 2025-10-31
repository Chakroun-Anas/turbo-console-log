export default {
  name: 'should handle nested conditions',
  lines: [
    'if (app.config.database.host === "localhost") {',
    '  if (app.config.debug) {',
    '    console.log("Debug mode");',
    '  }',
    '}',
  ],
  fileExtension: '.ts',
  selectionLine: 0,
  variableName: 'app.config.database.host',
  expectedLine: 0,
};
