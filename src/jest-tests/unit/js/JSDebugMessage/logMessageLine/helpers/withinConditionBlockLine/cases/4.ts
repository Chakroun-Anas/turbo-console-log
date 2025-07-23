export default {
  name: 'should fall back to next line when no condition found',
  lines: [
    'const normalAssignment = someValue;',
    'console.log(normalAssignment);',
  ],
  selectionLine: 0,
  variableName: 'someValue',
  expectedLine: 1,
};
