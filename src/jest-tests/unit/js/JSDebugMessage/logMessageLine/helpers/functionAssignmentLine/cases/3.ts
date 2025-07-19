export default {
  name: 'arrow function assigned to variable, concise body',
  lines: ['const double = (n: number) => n * 2;', 'console.log(double(4));'],
  selectionLine: 0,
  selectedVar: 'double',
  expectedLine: 1,
};
