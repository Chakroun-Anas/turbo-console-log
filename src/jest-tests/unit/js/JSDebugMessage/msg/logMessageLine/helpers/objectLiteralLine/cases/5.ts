export default {
  name: 'object literal with computed property',
  fileExtension: '.ts',
  lines: [
    'const config = {',
    '  theme: "light",',
    '  layout: { width: 1200, height: 800 }',
    '};',
  ],
  selectionLine: 0,
  variableName: 'config',
  expectedLine: 4,
};
