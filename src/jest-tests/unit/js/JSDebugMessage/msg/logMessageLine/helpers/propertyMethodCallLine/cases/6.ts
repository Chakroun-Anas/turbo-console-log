export default {
  name: 'should return the throw line when the call is inside a throw',
  fileExtension: '.js',
  lines: [
    'function assertConfig(missing) {',
    "  throw new Error(missing.join(', '));",
    '}',
  ],
  selectionLine: 1,
  selectedText: 'missing',
  expectedLine: 1,
};
