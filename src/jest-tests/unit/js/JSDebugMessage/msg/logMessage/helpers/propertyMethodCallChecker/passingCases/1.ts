export default {
  name: 'should detect method call on property access – this.subscriptions.add()',
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
};
