export default {
  name: 'Astro - Basic component with frontmatter script',
  fileExtension: '.astro',
  sourceCode: [
    '---',
    'const title = "My Astro Page";',
    'const items = ["Item 1", "Item 2", "Item 3"];',
    '---',
    '',
    '<html>',
    '  <head>',
    '    <title>{title}</title>',
    '  </head>',
    '  <body>',
    '    <h1>{title}</h1>',
    '    <ul>',
    '      {items.map(item => <li>{item}</li>)}',
    '    </ul>',
    '  </body>',
    '</html>',
  ],
  selectionLine: 2, // Line where "const items" is - 0-based
};
