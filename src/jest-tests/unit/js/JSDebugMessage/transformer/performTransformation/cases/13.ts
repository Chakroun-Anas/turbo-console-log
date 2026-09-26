export default {
  fileExtension: '.ts',
  name: 'multi-line body whose first statement sits on the brace line',
  lines: [
    'function total(items) { let sum = 0;',
    '  for (const item of items) sum += item.price;',
    '  return sum;',
    '}',
  ],
  selectedVar: 'items',
  line: 0,
  debuggingMsg: 'console.log("DEBUG")',
  expected: [
    'function total(items) {',
    '  console.log("DEBUG");',
    '  let sum = 0;',
    '  for (const item of items) sum += item.price;',
    '  return sum;',
    '}',
  ],
};
