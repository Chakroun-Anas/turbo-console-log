export default {
  name: 'should return the next line after user.session.invalidate()',
  fileExtension: '.ts',
  lines: ['function logout() {', '  user.session.invalidate();', '}'],
  selectionLine: 1,
  selectedText: 'user.session',
  expectedLine: 2,
};
