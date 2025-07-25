export default {
  name: 'multiline object, cursor on non-ternary key',
  lines: [
    'const options = {',
    "  size: 'M',",
    "  mode: isLarge ? 'expanded' : 'compact',",
    '};',
  ],
  selectionLine: 1,
  variableName: 'size',
};
