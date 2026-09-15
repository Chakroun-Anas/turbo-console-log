// A switch is a statement boundary: the discriminant is logged before the
// switch, not at the top of the enclosing function.
export default {
  name: 'switch discriminant is logged before the switch',
  fileExtension: '.ts',
  lines: [
    'function reducer(state, action) {',
    '  switch (action.type) {',
    "    case 'add':",
    '      return [...state, action.payload];',
    '    default:',
    '      return state;',
    '  }',
    '}',
  ],
  selectionLine: 1,
  variableName: 'action.type',
  expectedLine: 1,
};
