// Complex nested object in return
export default {
  name: 'complex nested object in return',
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
};
