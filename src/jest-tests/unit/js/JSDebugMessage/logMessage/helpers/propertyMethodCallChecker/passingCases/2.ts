export default {
  name: 'should detect method call on nested object – user.session.invalidate()',
  lines: ['function logout() {', '  user.session.invalidate();', '}'],
  selectionLine: 1,
  selectedText: 'user.session',
};
