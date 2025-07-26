export default {
  name: 'arrow function spanning multiple lines before body',
  lines: [
    'const add =',
    '(a: number, b: number)',
    '=> {',
    '  return a + b;',
    '};',
    'console.log(add(1, 2));',
  ],
  selectionLine: 0,
  selectedVar: 'add',
  expectedLine: 5,
};
