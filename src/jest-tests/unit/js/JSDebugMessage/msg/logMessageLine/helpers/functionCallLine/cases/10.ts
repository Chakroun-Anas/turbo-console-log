export default {
  fileExtension: '.ts',
  name: 'function call with deeply nested config',
  lines: [
    'const res = compute({',
    '  data: [',
    '    { id: 1, name: "A" },',
    '    { id: 2, name: "B" },',
    '  ]',
    '});',
  ],
  selectionLine: 0,
  variableName: 'res',
  expectedLine: 6,
};
