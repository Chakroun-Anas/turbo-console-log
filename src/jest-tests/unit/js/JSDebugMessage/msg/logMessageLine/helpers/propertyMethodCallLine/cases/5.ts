export default {
  name: 'should return the declaration start line for the root of a multi-line chain',
  fileExtension: '.ts',
  lines: [
    'function activeIds(users) {',
    '  const ids = users',
    '    .filter((u) => u.active)',
    '    .map((u) => u.id);',
    '  return ids;',
    '}',
  ],
  selectionLine: 1,
  selectedText: 'users',
  expectedLine: 1,
};
