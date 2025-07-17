export default {
  name: 'should NOT match standalone property access – this.foo',
  lines: ['function setup() {', '  const x = this.foo;', '}'],
  selectionLine: 1,
  selectedText: 'this.foo',
};
