// Selecting the VALUE of a property in a returned object literal — the
// counterpart to selecting the key (rawPropertyAccessLine cases 5 & 6).
// Both selections must resolve to the same anchor.
export default {
  name: 'property value inside a returned object literal',
  fileExtension: '.ts',
  lines: [
    'function toDto(user) {',
    '  return {',
    '    id: user.id,',
    '    name: user.name,',
    '  };',
    '}',
  ],
  selectionLine: 2,
  variableName: 'user.id',
  expected: 1, // before the return — nothing after it is reachable
};
