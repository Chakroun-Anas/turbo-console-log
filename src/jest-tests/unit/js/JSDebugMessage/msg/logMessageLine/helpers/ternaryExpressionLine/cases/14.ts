export default {
  name: 'first declarator of a multi-line const list with a ternary - after the whole list',
  fileExtension: '.js',
  lines: [
    "const level = isProd ? 'info' : 'debug',",
    '  pretty = !isProd;',
    'const logger = pino({ level });',
  ],
  selectionLine: 0,
  variableName: 'level',
  expectedLine: 2,
};
