export default {
  fileExtension: '.ts',
  name: 'property in a returned object literal (no root variable)',
  lines: [
    'function toDto(user) {',
    '  return {',
    '    id: user.id,',
    '    name: user.name,',
    '  };',
    '}',
  ],
  selectionLine: 2,
  variableName: 'id',
  // No root variable to anchor to: inside the literal is a syntax error and
  // nothing after a `return` runs, so the anchor is the enclosing statement.
  expectedLine: 1,
};
