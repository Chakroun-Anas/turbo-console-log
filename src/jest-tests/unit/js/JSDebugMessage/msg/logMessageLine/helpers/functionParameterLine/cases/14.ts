export default {
  fileExtension: '.ts',
  name: 'catch clause parameter',
  lines: ['try {', '  run();', '} catch (err) {', '  handle(err);', '}'],
  selectionLine: 2,
  variableName: 'err',
  expected: 3,
};
