export default {
  name: 'should return the loop line when the object is in a for-of head',
  fileExtension: '.ts',
  lines: [
    'for (const [key, value] of settings.entries()) {',
    '  apply(key, value);',
    '}',
  ],
  selectionLine: 0,
  selectedText: 'settings',
  expectedLine: 0,
};
