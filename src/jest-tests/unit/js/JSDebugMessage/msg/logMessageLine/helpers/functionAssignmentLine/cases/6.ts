export default {
  name: 'arrow function inside parentheses',
  lines: [
    'const wrapped = (',
    '  () => {',
    '    return 42;',
    '  }',
    ');',
    'console.log(wrapped());',
  ],
  selectionLine: 0,
  selectedVar: 'wrapped',
  expectedLine: 4,
};
