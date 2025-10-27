export default {
  fileExtension: '.ts',
  name: 'nested destructuring inside method',
  lines: [
    'class Controller {',
    '  handleSubmit({ user: { id, email } }) {',
    '    return email;',
    '  }',
    '}',
  ],
  selectionLine: 1,
  variableName: 'email',
  expected: 2,
};
