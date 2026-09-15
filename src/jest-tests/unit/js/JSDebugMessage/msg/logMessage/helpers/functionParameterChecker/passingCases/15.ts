export default {
  name: 'catch clause parameter',
  fileExtension: '.ts',
  lines: ['try {', '  run();', '} catch (err) {', '  handle(err);', '}'],
  selectionLine: 2,
  variableName: 'err',
};
