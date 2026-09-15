// Selecting the VALUE of a property in an object literal that IS bound to a
// root variable. The key selection resolves through rawPropertyAccess
// (`dto.id`, after the declaration); the value selection anchors before it.
export default {
  name: 'property value inside an object literal bound to a variable',
  fileExtension: '.ts',
  lines: [
    'function toDto(user) {',
    '  const dto = {',
    '    id: user.id,',
    '  };',
    '  return dto;',
    '}',
  ],
  selectionLine: 2,
  variableName: 'user.id',
  expectedLine: 1,
};
