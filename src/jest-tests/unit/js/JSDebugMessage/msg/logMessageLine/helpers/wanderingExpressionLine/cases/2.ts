export default {
  name: 'property access in ternary',
  fileExtension: '.ts',
  lines: [
    'const greeting = user.profile.name',
    '  ? `Hello, ${user.profile.name}!`',
    '  : "Hello there!"',
  ],
  selectionLine: 0,
  variableName: 'user.profile.name',
  expectedLine: 3,
};
