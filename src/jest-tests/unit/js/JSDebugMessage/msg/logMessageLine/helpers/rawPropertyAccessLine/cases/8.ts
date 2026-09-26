export default {
  fileExtension: '.ts',
  name: 'key in an object passed as a call argument of a declaration',
  lines: [
    'const response = await fetch(url, {',
    "  method: 'POST',",
    '  body: payload,',
    '});',
  ],
  selectionLine: 2,
  variableName: 'body',
  // No root: the value is logged before the enclosing statement.
  expectedLine: 0,
};
