export default {
  name: 'arrow function with object literal return (parenthesized)',
  lines: [
    'const data = items.map(raw => ({',
    '  ...raw,',
    '  processed: true',
    '}));',
  ],
  selectedVar: 'raw',
  line: 0,
  debuggingMsg: 'console.log("DEBUG")',
  expected: [
    'const data = items.map(raw => {',
    '  console.log("DEBUG");',
    '  return {',
    '  ...raw,',
    '  processed: true',
    '};',
    '});',
  ],
};
