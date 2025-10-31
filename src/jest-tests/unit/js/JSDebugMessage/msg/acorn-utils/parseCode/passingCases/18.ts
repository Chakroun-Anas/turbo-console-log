export default {
  name: 'Svelte - Basic component with script tag',
  fileExtension: '.svelte',
  sourceCode: [
    '<script>',
    '  let count = 0;',
    '  function increment() {',
    '    count += 1;',
    '  }',
    '</script>',
    '',
    '<button on:click={increment}>',
    '  Count: {count}',
    '</button>',
  ],
  selectionLine: 1, // Line where "let count = 0" is - 0-based
};
