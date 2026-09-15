export default {
  name: 'key in a declared object wrapped in satisfies',
  fileExtension: '.ts',
  lines: [
    'const theme = {',
    '  colors: {',
    "    primary: '#0055ff',",
    '  },',
    '} satisfies ThemeConfig;',
  ],
  selectionLine: 2,
  selectedText: 'primary',
  deepObjectPath: 'theme.colors.primary',
};
