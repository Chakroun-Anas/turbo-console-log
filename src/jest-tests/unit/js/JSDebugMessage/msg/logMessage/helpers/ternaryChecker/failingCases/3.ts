export default {
  name: 'ternary in deep nested variable, wrong target',
  lines: [
    'const settings = {',
    '  theme: "light",',
    '  flags: {',
    '    isBeta: cond ? true : false',
    '  }',
    '};',
  ],
  selectionLine: 1,
  variableName: 'theme',
};
