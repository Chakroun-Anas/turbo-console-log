export default {
  name: 'deeply nested chain across lines',
  lines: [
    'const finalResult = user',
    '  .getProfile()',
    '  .settings()',
    '  .theme.getColor();',
  ],
  selectionLine: 0,
  variableName: 'finalResult',
};
