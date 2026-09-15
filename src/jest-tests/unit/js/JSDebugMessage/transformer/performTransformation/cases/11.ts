export default {
  fileExtension: '.ts',
  name: 'empty object-literal method stub',
  lines: [
    'export default {',
    '  methods: {',
    '    onBlur(event) {},',
    '  },',
    '};',
  ],
  selectedVar: 'event',
  line: 2,
  debuggingMsg: 'console.log("DEBUG")',
  expected: [
    'export default {',
    '  methods: {',
    '    onBlur(event) {',
    '      console.log("DEBUG");',
    '    },',
    '  },',
    '};',
  ],
};
