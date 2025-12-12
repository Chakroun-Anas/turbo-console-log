export default {
  name: 'JSX syntax error - malformed JSX in .js file',
  sourceCode: [
    "import React from 'react';",
    '',
    'function BrokenComponent() {',
    '  return (',
    '    <div>',
    '      <h1>Missing closing tag',
    '  );',
    '}',
  ],
  fileExtension: '.js',
  selectionLine: 3,
  expectedError: 'Failed to parse source code',
};
