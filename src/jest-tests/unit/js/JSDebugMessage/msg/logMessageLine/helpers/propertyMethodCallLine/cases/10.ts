export default {
  name: 'should return the label line when the object is in a labelled loop head',
  fileExtension: '.js',
  lines: ['outer:', 'while (queue.shift()) {', '  if (done) break outer;', '}'],
  selectionLine: 1,
  selectedText: 'queue',
  expectedLine: 0,
};
