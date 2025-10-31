export default {
  name: 'deep property access inside method assignment (this.subscription)',
  lines: [
    'function someFunc() {',
    '  this.subscription = this.userService.currentUser.subscribe(',
    '    (userData: User) => {',
    '      this.canModify = userData.username === this.comment.author.username;',
    '    },',
    '  );',
    '}',
  ],
  fileExtension: '.ts',
  selectionLine: 1,
  variableName: 'this.subscription',
  expectedLine: 6,
};
