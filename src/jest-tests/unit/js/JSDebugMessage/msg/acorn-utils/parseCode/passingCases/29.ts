export default {
  name: 'JSX with arrow function and implicit return in .js file',
  sourceCode: [
    "import React from 'react';",
    '',
    'const Greeting = ({ name }) => (',
    '  <div className="greeting">',
    '    <h1>Hello, {name}!</h1>',
    '  </div>',
    ');',
    '',
    'export default Greeting;',
  ],
  fileExtension: '.js',
  selectionLine: 2,
};
