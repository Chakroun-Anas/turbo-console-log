export default {
  name: 'function assigned with newline before name',
  lines: [
    'const',
    '  weird = function () {',
    '    return "ok";',
    '  };',
    'console.log(weird());',
  ],
  selectionLine: 1,
  selectedVar: 'weird',
  expectedLine: 4,
};
