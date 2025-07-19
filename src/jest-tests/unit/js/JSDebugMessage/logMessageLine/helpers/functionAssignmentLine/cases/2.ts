export default {
  name: 'arrow function assigned to variable, block body',
  lines: [
    'const compute = (x: number) => {',
    '  return x * 2;',
    '};',
    'console.log(compute(4));',
  ],
  selectionLine: 0,
  selectedVar: 'compute',
  expectedLine: 3,
};
