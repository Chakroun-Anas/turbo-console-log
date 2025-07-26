export default {
  name: 'should NOT match direct function call – someFn()',
  lines: ['function run() {', '  someFn();', '}'],
  selectionLine: 1,
  selectedText: 'someFn',
};
