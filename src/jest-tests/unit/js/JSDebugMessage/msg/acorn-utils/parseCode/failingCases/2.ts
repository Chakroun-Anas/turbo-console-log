export default {
  name: 'Vue SFC with no script tag',
  fileExtension: '.vue',
  sourceCode: [
    '<template>',
    '  <div>',
    '    <h1>Hello World</h1>',
    '    <p>This Vue component has no script section!</p>',
    '  </div>',
    '</template>',
    '',
    '<style scoped>',
    'div {',
    '  padding: 20px;',
    '  color: blue;',
    '}',
    '</style>',
  ],
  expectedError:
    'No <script> block found in this .vue file. Add a <script> or <script setup> section to use Turbo logging.',
};
