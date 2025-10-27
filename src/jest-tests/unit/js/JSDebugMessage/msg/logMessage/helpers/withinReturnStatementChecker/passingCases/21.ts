// Object with spread assignment
export default {
  name: 'object with spread assignment',
  fileExtension: '.ts',
  lines: [
    'function mergeUser(user, extra) {',
    '  return { ...user.profile, ...extra };',
    '}',
  ],
  selectionLine: 1,
  variableName: 'user.profile',
};
