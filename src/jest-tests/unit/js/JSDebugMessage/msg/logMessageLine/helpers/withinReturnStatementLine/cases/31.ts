// Same as case 30 with a deeper member chain, so the anchor is not tied to
// a single-level property access.
export default {
  name: 'deep property value inside a returned object literal',
  fileExtension: '.ts',
  lines: [
    'function toDto(user) {',
    '  return {',
    '    id: user.profile.id,',
    '  };',
    '}',
  ],
  selectionLine: 2,
  variableName: 'user.profile.id',
  expected: 1,
};
