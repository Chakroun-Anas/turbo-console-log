export default {
  name: 'Svelte - Component with reactive declarations',
  fileExtension: '.svelte',
  sourceCode: [
    '<script>',
    '  let firstName = "John";',
    '  let lastName = "Doe";',
    '  ',
    '  $: fullName = `${firstName} ${lastName}`;',
    '  $: greeting = `Hello, ${fullName}!`;',
    '</script>',
    '',
    '<input bind:value={firstName} />',
    '<input bind:value={lastName} />',
    '<p>{greeting}</p>',
  ],
  selectionLine: 4, // Line where reactive statement "$: fullName" is - 0-based
};
