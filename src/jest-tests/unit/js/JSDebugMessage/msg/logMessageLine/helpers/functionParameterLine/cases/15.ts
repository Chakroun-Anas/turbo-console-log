export default {
  fileExtension: '.ts',
  name: 'destructured catch clause parameter',
  lines: [
    'try {',
    '  run();',
    '} catch ({ message }) {',
    '  handle(message);',
    '}',
  ],
  selectionLine: 2,
  variableName: 'message',
  expected: 3,
};
