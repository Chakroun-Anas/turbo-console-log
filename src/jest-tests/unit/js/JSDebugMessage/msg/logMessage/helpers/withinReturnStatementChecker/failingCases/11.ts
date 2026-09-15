// Statement inside a callback body that is itself nested in a return argument:
// the callback owns the line, not the outer return
export default {
  name: 'statement inside a reduce callback nested in a return',
  fileExtension: '.js',
  lines: [
    'function indexById(items) {',
    '  return items.reduce((acc, item) => {',
    '    acc[item.id] = item;',
    '    return acc;',
    '  }, {});',
    '}',
  ],
  selectionLine: 2,
  variableName: 'item',
};
