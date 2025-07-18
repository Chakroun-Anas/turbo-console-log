export default {
  name: 'comparison assignment with selection inside comment',
  lines: [
    '// prepare comparison',
    'const isEqual = a === b;',
    'doSomething(isEqual);',
  ],
  selectionLine: 1,
  variableName: 'isEqual',
  expectedLine: 2,
};
