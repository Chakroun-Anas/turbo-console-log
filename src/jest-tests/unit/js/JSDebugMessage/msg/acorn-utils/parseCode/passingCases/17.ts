export default {
  name: 'HTML - JavaScript in script tag',
  fileExtension: '.html',
  sourceCode: [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '  <script>',
    '    const greeting = "Hello";',
    '    console.log(greeting);',
    '  </script>',
    '</head>',
    '<body></body>',
    '</html>',
  ],
  selectionLine: 4, // Line where "const greeting" is - 0-based
};
