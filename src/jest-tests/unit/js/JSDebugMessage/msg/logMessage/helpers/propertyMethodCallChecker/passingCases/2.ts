export default {
  name: 'should detect method call on nested object – user.session.invalidate()',
  fileExtension: '.ts',
  lines: ['function logout() {', '  user.session.invalidate();', '}'],
  selectionLine: 1,
  selectedText: 'user.session',
};
