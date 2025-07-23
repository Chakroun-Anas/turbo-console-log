export default {
  name: 'object destructuring multiline',
  lines: [
    'const {',
    '  config,',
    '  env,',
    '} = process;',
    'console.log(config);',
  ],
  selectionLine: 1,
  variableName: 'config',
  expectedLine: 4,
};
