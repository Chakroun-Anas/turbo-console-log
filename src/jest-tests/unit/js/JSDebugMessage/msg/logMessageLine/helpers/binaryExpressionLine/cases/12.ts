export default {
  name: 'first declarator of a multi-line var list with a logical default - after the whole list',
  fileExtension: '.js',
  lines: [
    'function Router(options) {',
    '  var opts = options || {},',
    '    strict = opts.strict;',
    '  this.strict = strict;',
    '}',
  ],
  selectionLine: 1,
  variableName: 'opts',
  expectedLine: 3,
};
