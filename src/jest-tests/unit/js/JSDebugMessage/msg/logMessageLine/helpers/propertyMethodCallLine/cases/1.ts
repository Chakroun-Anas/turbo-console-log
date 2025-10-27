export default {
  name: 'should return the next line after this.subscriptions.add(...)',
  fileExtension: '.ts',
  lines: [
    'function myFunc() {',
    '  this.subscriptions.add(this.someService.someVar.subscribe((next) => {',
    '    this.mode = next;',
    '  }));',
    '}',
  ],
  selectionLine: 1,
  selectedText: 'this.subscriptions',
  expectedLine: 4,
};
