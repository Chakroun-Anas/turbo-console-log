export default {
  fileExtension: '.ts',
  name: 'arrow function with type assertion (as)',
  lines: [
    'const handler = (() => {',
    '  return true;',
    '}) as () => boolean;',
    'console.log(handler());',
  ],
  selectionLine: 0,
  selectedVar: 'handler',
  expectedLine: 3,
};
