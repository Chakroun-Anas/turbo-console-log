// Complex nested object in return with indentation
export default {
  name: 'complex nested object in return',
  fileExtension: '.ts',
  lines: [
    'function getUserData(user) {',
    '  return {',
    '    profile: {',
    '      name: user.firstName,',
    '      contact: user.email',
    '    },',
    '    settings: user.preferences',
    '  };',
    '}',
  ],
  selectionLine: 3, // Line with user.firstName
  variableName: 'user.firstName',
  expected: 1, // Before the return statement
};
