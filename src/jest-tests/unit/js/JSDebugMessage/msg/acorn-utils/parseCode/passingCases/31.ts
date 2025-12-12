export default {
  name: 'JSX with self-closing tags and spread props in .js file',
  sourceCode: [
    "import React from 'react';",
    '',
    'function Image({ src, alt, ...props }) {',
    '  const imageSrc = src || "/default.png";',
    '  return <img src={imageSrc} alt={alt} {...props} />;',
    '}',
    '',
    'export default Image;',
  ],
  fileExtension: '.js',
  selectionLine: 3,
};
