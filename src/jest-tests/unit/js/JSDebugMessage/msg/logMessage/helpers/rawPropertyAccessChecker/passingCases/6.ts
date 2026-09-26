export default {
  name: 'shorthand property in a returned object literal (no root variable)',
  fileExtension: '.ts',
  lines: ['function toDto(id, name) {', '  return { id, name };', '}'],
  selectionLine: 1,
  selectedText: 'id',
  // Shorthand desugars to `id: id`, so the value node is the binding itself —
  // the only shape where the logged expression looks like the key.
  deepObjectPath: 'id',
};
