export default {
  name: 'ternary as default value in object',
  lines: [
    'const config = {',
    "  level: env === 'dev' ? 'debug' : 'info',",
    '};',
    'init(config);',
  ],
  selectionLine: 1,
  variableName: 'config',
  expectedLine: 2,
};
