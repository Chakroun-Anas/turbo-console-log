export default {
  name: 'property in a returned object literal (no root variable)',
  fileExtension: '.ts',
  lines: [
    'function toDto(user) {',
    '  return {',
    '    id: user.id,',
    '    name: user.name,',
    '  };',
    '}',
  ],
  selectionLine: 2,
  selectedText: 'id',
  // No declared root to build a path from, and a key is not a binding: the
  // property's value node is what gets logged.
  deepObjectPath: 'user.id',
};
