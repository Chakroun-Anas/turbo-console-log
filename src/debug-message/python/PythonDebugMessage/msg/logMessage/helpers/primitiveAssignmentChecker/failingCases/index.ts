export default [
  {
    name: 'function call assignment — not primitive',
    lines: ['data = get_data()'],
    selectionLine: 0,
    variableName: 'data',
  },
  {
    name: 'binary expression assignment',
    lines: ['total = a + b'],
    selectionLine: 0,
    variableName: 'total',
  },
  {
    name: 'augmented assignment — not a simple assign',
    lines: ['x += 1'],
    selectionLine: 0,
    variableName: 'x',
  },
  {
    name: 'variable name mismatch',
    lines: ['x = 42'],
    selectionLine: 0,
    variableName: 'y',
  },
  {
    name: 'wrong selection line',
    lines: ['x = 42', 'y = "hello"'],
    selectionLine: 0,
    variableName: 'y',
  },
  {
    name: 'property access assignment — not primitive',
    lines: ['name = user.name'],
    selectionLine: 0,
    variableName: 'name',
  },
];
