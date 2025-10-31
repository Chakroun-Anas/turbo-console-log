export default {
  name: 'should NOT match direct function call – someFn()',
  fileExtension: '.ts',
  lines: ['function run() {', '  someFn();', '}'],
  selectionLine: 1,
  selectedText: 'someFn',
};
