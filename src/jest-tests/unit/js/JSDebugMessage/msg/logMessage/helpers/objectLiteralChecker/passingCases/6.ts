export default {
  name: 'Vue SFC - object literal in data function',
  fileExtension: '.vue',
  lines: [
    '<template>',
    '  <div>{{ user.name }}</div>',
    '</template>',
    '',
    '<script>',
    'export default {',
    '  data() {',
    '    const user = { name: "John", age: 30 };',
    '    return { user };',
    '  }',
    '};',
    '</script>',
  ],
  selectionLine: 7, // Line where "const user" is defined in the Vue SFC
  variableName: 'user',
};
