// Destructuring pattern should NOT be detected as property access
export default {
  name: 'destructuring pattern (should reject)',
  lines: [
    'function logPersonInfo(person: Person) {',
    '  const {',
    '    fullName,',
    '    age,',
    '    isMarried,',
    '  } = person;',
    '  return true;',
    '}',
  ],
  selectionLine: 2, // Line with "fullName," (0-indexed)
  selectedText: 'fullName',
};
